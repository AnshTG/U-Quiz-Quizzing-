import { UserProfile, SecurityIncident, SecurityIncidentType, SecuritySeverity } from '../types';
import { reportSecurityIncident } from './firebase';

// Helper to gather client diagnostic fingerprint
function getClientDiagnostics() {
  if (typeof window === 'undefined') return {};
  return {
    userAgent: navigator.userAgent?.slice(0, 150),
    pathname: window.location.pathname,
    screenResolution: `${window.innerWidth}x${window.innerHeight}`,
    onlineStatus: navigator.onLine,
  };
}

/**
 * 1. SSRF & MALICIOUS URL DETECTOR
 * Detects attempts to access localhost, internal private network IPs,
 * cloud metadata endpoints (169.254.169.254), or non-http protocols.
 */
export function inspectUrlForSecurity(rawUrl: string, currentUser?: UserProfile | null): {
  isSafe: boolean;
  reason?: string;
} {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isSafe: false, reason: 'Empty or invalid URL provided.' };
  }

  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { isSafe: false, reason: 'Invalid URL format.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    reportSecurityIncident({
      type: 'ssrf_probe',
      title: 'Disallowed Protocol Attempt in URL Ingestion',
      description: `User attempted to input URL with disallowed protocol: "${parsed.protocol}"`,
      severity: 'high',
      userId: currentUser?.uid || null,
      userName: currentUser?.displayName || 'Anonymous Scholar',
      userEmail: currentUser?.email || null,
      endpointOrContext: 'CustomSourceUploader / Webpage Fetch',
      detectedPayload: rawUrl.slice(0, 250),
      clientInfo: getClientDiagnostics(),
    }).catch(console.warn);

    return { isSafe: false, reason: 'Only HTTP and HTTPS URLs are permitted.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Forbidden hostnames: localhost, loopbacks, metadata services, link-local
  const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '::1' || hostname === '[::1]';
  const isMetadata = hostname === '169.254.169.254' || hostname.includes('metadata.google.internal');
  
  // Private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
  const isPrivateIp = 
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);

  // Hex or decimal encoded IP tricks e.g. 2130706433
  const isNumericIpTrick = /^\d+$/.test(hostname) || /^0x[0-9a-f]+$/i.test(hostname);

  if (isLoopback || isMetadata || isPrivateIp || isNumericIpTrick) {
    reportSecurityIncident({
      type: 'ssrf_probe',
      title: 'SSRF / Internal Network Access Attempt Blocked',
      description: `Attempted to probe internal host / IP: "${hostname}" via webpage ingestion.`,
      severity: 'critical',
      userId: currentUser?.uid || null,
      userName: currentUser?.displayName || 'Anonymous Scholar',
      userEmail: currentUser?.email || null,
      endpointOrContext: 'CustomSourceUploader / Webpage Fetch',
      detectedPayload: rawUrl.slice(0, 250),
      clientInfo: getClientDiagnostics(),
    }).catch(console.warn);

    return { 
      isSafe: false, 
      reason: 'Access to local, internal, or cloud infrastructure addresses is restricted for security.' 
    };
  }

  return { isSafe: true };
}

/**
 * 2. ADMIN AUTH BRUTE-FORCE & INJECTION DETECTOR
 */
const adminFailedAttempts: number[] = [];
let adminCooldownUntil = 0;

export function checkAdminPasscodeSafety(
  passcode: string,
  currentUser?: UserProfile | null
): {
  allowed: boolean;
  cooldownSeconds?: number;
  error?: string;
} {
  const now = Date.now();

  // Check active cooldown
  if (now < adminCooldownUntil) {
    const remaining = Math.ceil((adminCooldownUntil - now) / 1000);
    return {
      allowed: false,
      cooldownSeconds: remaining,
      error: `Too many failed attempts. Security cooldown active for ${remaining} seconds.`
    };
  }

  // Check for common injection patterns in password field
  const injectionPatterns = [
    /'\s*or\s*'1'\s*=\s*'1/i,
    /"\s*or\s*"1"\s*=\s*"1/i,
    /admin'\s*--/i,
    /union\s+select/i,
    /<script\b/i,
    /javascript:/i,
    /\{\s*"\$gt"/i,
    /;\s*drop\s+table/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(passcode)) {
      reportSecurityIncident({
        type: 'admin_injection_attempt',
        title: 'Injection String Injected in Admin Password Field',
        description: 'User attempted to inject SQL/NoSQL/XSS payload into the admin authentication modal.',
        severity: 'critical',
        userId: currentUser?.uid || null,
        userName: currentUser?.displayName || 'Guest User',
        userEmail: currentUser?.email || null,
        endpointOrContext: 'AdminAuthModal',
        detectedPayload: passcode.slice(0, 100),
        clientInfo: getClientDiagnostics(),
      }).catch(console.warn);

      // Trigger instant cooldown
      adminCooldownUntil = now + 45000;
      return {
        allowed: false,
        cooldownSeconds: 45,
        error: 'Security Notice: Potential malicious input detected. Port has been temporarily frozen.'
      };
    }
  }

  return { allowed: true };
}

export function recordFailedAdminAttempt(currentUser?: UserProfile | null): {
  cooldownTriggered: boolean;
  remainingSeconds?: number;
} {
  const now = Date.now();
  // Filter attempts in last 60 seconds
  const recent = adminFailedAttempts.filter(t => now - t < 60000);
  recent.push(now);
  adminFailedAttempts.length = 0;
  adminFailedAttempts.push(...recent);

  if (recent.length >= 3) {
    // Trigger 30s cooldown
    adminCooldownUntil = now + 30000;

    reportSecurityIncident({
      type: 'admin_brute_force',
      title: 'Repeated Failed Admin Passcode Attempts (Brute-Force)',
      description: `Scholar failed ${recent.length} consecutive administrator password attempts within 60 seconds. Cooldown initiated.`,
      severity: 'high',
      userId: currentUser?.uid || null,
      userName: currentUser?.displayName || 'Guest User',
      userEmail: currentUser?.email || null,
      endpointOrContext: 'AdminAuthModal',
      clientInfo: getClientDiagnostics(),
    }).catch(console.warn);

    return { cooldownTriggered: true, remainingSeconds: 30 };
  }

  return { cooldownTriggered: false };
}

/**
 * 3. CHAT SPAM, FLOODING & XSS DETECTOR
 */
const userChatTimestamps: Record<string, number[]> = {};

export function validateChatMessageSecurity(
  text: string,
  user: UserProfile | null
): {
  isSafe: boolean;
  sanitizedText: string;
  error?: string;
} {
  const now = Date.now();
  const userId = user?.uid || 'anonymous';

  // 1. Flood Rate-Limiter (Max 4 messages in 6 seconds)
  const history = userChatTimestamps[userId] || [];
  const recent = history.filter(t => now - t < 6000);
  recent.push(now);
  userChatTimestamps[userId] = recent;

  if (recent.length > 4) {
    reportSecurityIncident({
      type: 'chat_spam_flood',
      title: 'Public Chat Rapid Message Flooding Detected',
      description: `User "${user?.displayName || userId}" sent ${recent.length} messages within 6 seconds, triggering the spam flood brake.`,
      severity: 'medium',
      userId: user?.uid || null,
      userName: user?.displayName || 'Scholar',
      userEmail: user?.email || null,
      endpointOrContext: 'ChatView / Public Room',
      detectedPayload: text.slice(0, 150),
      clientInfo: getClientDiagnostics(),
    }).catch(console.warn);

    return {
      isSafe: false,
      sanitizedText: text,
      error: 'You are sending messages too quickly. Please pause for 5 seconds before speaking again.'
    };
  }

  // 2. XSS and Malicious Script Pattern Scanning
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi
  ];

  let hasXss = false;
  for (const pattern of xssPatterns) {
    if (pattern.test(text)) {
      hasXss = true;
      break;
    }
  }

  if (hasXss) {
    reportSecurityIncident({
      type: 'chat_xss_probe',
      title: 'XSS Script Payload Injected in Public Chat',
      description: `User "${user?.displayName || userId}" attempted to submit a script or executable tag in community chat. Payload was sanitized.`,
      severity: 'high',
      userId: user?.uid || null,
      userName: user?.displayName || 'Scholar',
      userEmail: user?.email || null,
      endpointOrContext: 'ChatView / Public Room',
      detectedPayload: text.slice(0, 200),
      clientInfo: getClientDiagnostics(),
    }).catch(console.warn);

    // Sanitize string
    const sanitized = text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/javascript:/gi, '[blocked-js:]');

    return {
      isSafe: false,
      sanitizedText: sanitized,
      error: 'Special executable tags are not allowed in community chat for student safety.'
    };
  }

  return { isSafe: true, sanitizedText: text };
}

/**
 * 4. QUIZ ASSESSMENT ANTI-TAMPER & PROCTOR ANOMALY DETECTOR
 */
export function reportExamTabSwitchAnomaly(
  switchCount: number,
  subject: string,
  user?: UserProfile | null
) {
  reportSecurityIncident({
    type: 'exam_tab_switch_anomaly',
    title: `Exam Proctor: Frequent Tab-Switching Detected (${switchCount} switches)`,
    description: `Scholar switched away from the active assessment window ${switchCount} times during the "${subject}" exam session.`,
    severity: switchCount >= 5 ? 'high' : 'medium',
    userId: user?.uid || null,
    userName: user?.displayName || 'Scholar',
    userEmail: user?.email || null,
    endpointOrContext: 'QuizView Proctor System',
    clientInfo: getClientDiagnostics(),
  }).catch(console.warn);
}

export function validateQuizSubmissionIntegrity(
  score: number,
  total: number,
  timeSpentSeconds: number,
  questionCount: number,
  userAnswers: (string | null)[],
  user?: UserProfile | null,
  subjectName?: string
): {
  isValid: boolean;
  validatedScore: number;
  anomalyDetected: boolean;
  reason?: string;
} {
  let validatedScore = score;
  let anomalyDetected = false;
  let reason = '';

  // Check 1: Impossible Score Injection (score > total or score > questionCount)
  if (score > total || score > questionCount || total !== questionCount) {
    anomalyDetected = true;
    reason = `Score overflow tampering: score (${score}) > total (${total}/${questionCount}).`;
    validatedScore = Math.min(Math.max(0, score), questionCount);

    reportSecurityIncident({
      type: 'score_tamper_attempt',
      title: 'Score Overflow / Injected Points Detected',
      description: `Detected attempted submission of impossible score (${score}/${total} for ${questionCount} questions) in "${subjectName || 'NCERT Quiz'}". Clamped to ${validatedScore}.`,
      severity: 'high',
      userId: user?.uid || null,
      userName: user?.displayName || 'Scholar',
      userEmail: user?.email || null,
      endpointOrContext: 'Quiz Submission Handler',
      detectedPayload: JSON.stringify({ score, total, questionCount, userAnswersLength: userAnswers.length }),
      clientInfo: getClientDiagnostics(),
    }).catch(console.warn);
  }

  // Check 2: Automated Bot Speed Anomaly (e.g. 10+ questions completed in under 2.5 seconds with 100% score)
  if (questionCount >= 5 && timeSpentSeconds < 3 && score / total >= 0.8) {
    anomalyDetected = true;
    reason = `Inhuman completion speed: ${questionCount} questions answered in ${timeSpentSeconds}s with ${(score / total * 100).toFixed(0)}% accuracy.`;

    reportSecurityIncident({
      type: 'exam_bot_speed_anomaly',
      title: 'Inhuman Bot Speed Anomaly During Assessment',
      description: `Assessment submitted in ${timeSpentSeconds}s with score ${score}/${total}. Likely automated script or programmatic answer injector.`,
      severity: 'high',
      userId: user?.uid || null,
      userName: user?.displayName || 'Scholar',
      userEmail: user?.email || null,
      endpointOrContext: 'QuizView / Results Validation',
      clientInfo: getClientDiagnostics(),
    }).catch(console.warn);
  }

  return {
    isValid: !anomalyDetected,
    validatedScore,
    anomalyDetected,
    reason
  };
}

/**
 * 5. CHALLENGE CODE BRUTE-FORCE DETECTOR
 */
const challengeCodeFails: number[] = [];
let challengeCooldownUntil = 0;

export function recordChallengeCodeFailure(user?: UserProfile | null): {
  cooldownActive: boolean;
  remainingSeconds?: number;
} {
  const now = Date.now();
  if (now < challengeCooldownUntil) {
    return {
      cooldownActive: true,
      remainingSeconds: Math.ceil((challengeCooldownUntil - now) / 1000)
    };
  }

  const recent = challengeCodeFails.filter(t => now - t < 30000);
  recent.push(now);
  challengeCodeFails.length = 0;
  challengeCodeFails.push(...recent);

  if (recent.length >= 5) {
    challengeCooldownUntil = now + 20000;

    reportSecurityIncident({
      type: 'challenge_code_bruteforce',
      title: 'Rapid Challenge Code Enumeration / Brute-Force',
      description: `User tried 5 non-existent challenge codes within 30 seconds. Imposed 20s cooldown brake.`,
      severity: 'medium',
      userId: user?.uid || null,
      userName: user?.displayName || 'Scholar',
      userEmail: user?.email || null,
      endpointOrContext: 'JoinQuizModal',
      clientInfo: getClientDiagnostics(),
    }).catch(console.warn);

    return { cooldownActive: true, remainingSeconds: 20 };
  }

  return { cooldownActive: false };
}
