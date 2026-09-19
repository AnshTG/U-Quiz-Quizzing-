
export type SyllabusYear = '2026-27' | '2025-26';

export interface NCERTEntry {
  subjectName: string;
  className: string;
  chapterName: string;
  syllabusYear?: SyllabusYear;
  textbookName?: string;
}

export type QuizSourceType = 'syllabus' | 'pdf' | 'notes' | 'webpage' | 'text';

export interface QuizConfig {
  class: string;
  subject: string;
  topics: string[];
  strength: 'Easy' | 'Medium' | 'Hard';
  quantity: number;
  timeLimitMinutes?: number; // 0 = untimed
  syllabusYear?: SyllabusYear;
  questionType?: 'single' | 'multiple' | 'both';
  customInstructions?: string; // User custom instructions strictly bounded by system instructions
  sourceType?: QuizSourceType; // Origin of the quiz content: NCERT syllabus or custom source
  sourceTitle?: string; // Title or file name of the custom source
  sourceContent?: string; // Transcribed notes, PDF text, or webpage content
  sourceMimeType?: string; // e.g., 'image/png', 'image/jpeg', 'application/pdf'
  sourceFileBase64?: string; // Base64 representation of uploaded image or PDF document
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  isMultiple?: boolean;
}

export interface QuizResultRecord {
  id: string;
  date: string;
  timestamp?: number;
  config: QuizConfig;
  score: number;
  total: number;
  timeSpentSeconds: number;
  questions: Question[];
  userAnswers: (string | null)[];
  sharedQuizId?: string;
  userName?: string;
  timeIST?: string;
  subject?: string;
  class?: string;
  topics?: string[];
  strength?: string;
}

export interface AdminUserQuizEntry extends QuizResultRecord {
  userId: string;
  userDisplayName?: string;
  userEmail?: string;
  userPhoto?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
  lastLoginAt?: string;
  updatedAt?: string;
  quizzesCompleted?: number;
  totalQuestionsAnswered?: number;
  totalScore?: number;
  savedQuizzesCount?: number;
  currentStreak?: number;
  lastCheckInDate?: string;
  attendanceDaysCount?: number;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  date: string; // YYYY-MM-DD
  timestamp: number;
  timeStr: string; // e.g. "10:30 AM IST"
  activityType: 'manual_checkin' | 'quiz_completion' | 'daily_login' | 'chat_interaction';
  currentStreak: number;
  subjectAttempted?: string;
  scoreGained?: number;
}

export interface SavedQuizRecord {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: string;
  timestamp: number;
  config: QuizConfig;
  questions: Question[];
  isPreSaved?: boolean;
}

export interface SharedQuiz {
  id: string;
  creatorId?: string;
  creatorName?: string;
  creatorPhoto?: string;
  title: string;
  createdAt: string;
  timestamp: number;
  config: QuizConfig;
  questions: Question[];
  playsCount: number;
  viewsCount?: number;
}

export interface LeaderboardUser {
  rank: number;
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  totalScore: number;
  quizzesCompleted: number;
  totalQuestionsAnswered: number;
  accuracy: number; // 0 - 100%
  lastActive?: string;
  bestSubject?: string;
  isCurrentUser?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  message: string;
  timestamp: number;
  createdAt: string;
  subjectTag?: string;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  imageUrl?: string;
  imageName?: string;
  isPending?: boolean;
  sendFailed?: boolean;
}

export interface GeminiChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  subjectContext?: string;
  classContext?: string;
  reactions?: Record<string, number>; // emoji -> count
  isTestable?: boolean; // Evaluated by AI tutor if the response explains testable academic concepts
}

export type FeatureKey =
  | 'quiz_generation'
  | 'ai_chat'
  | 'multiplayer'
  | 'curriculum'
  | 'webpage_fetch'
  | 'ocr_scan'
  | 'flashcards'
  | 'leaderboard'
  | 'feedback_submit';

export interface FeatureMaintenanceConfig {
  isUnderMaintenance: boolean;
  message?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FeatureMetadata {
  key: FeatureKey;
  name: string;
  category: 'AI & Generation' | 'Study & Revision' | 'Social & Competition' | 'Input & Media';
  description: string;
  affectedButtons: string[];
  defaultMessage: string;
}

export const PLATFORM_FEATURES: FeatureMetadata[] = [
  {
    key: 'webpage_fetch',
    name: 'Wikipedia & Webpage Extractor',
    category: 'Input & Media',
    description: 'Instant academic text extraction from Wikipedia articles and educational links.',
    affectedButtons: ['"Fetch Webpage"', '"Extract Wikipedia Link"'],
    defaultMessage: 'Webpage & Wikipedia extraction is undergoing scheduled maintenance. You can paste study notes or text directly into the notes field.'
  },
  {
    key: 'quiz_generation',
    name: 'AI Quiz Generation',
    category: 'AI & Generation',
    description: 'Generates NCERT syllabus-aligned multiple choice and numerical quizzes.',
    affectedButtons: ['"Generate Quiz"', '"Custom Source Quiz"', '"Start Practice Quiz"'],
    defaultMessage: 'Quiz generation is currently undergoing scheduled platform upgrades to expand question banks. Please explore the NCERT Curriculum directory or Flashcards.'
  },
  {
    key: 'ai_chat',
    name: 'AI Study Tutor (NCERT Chat)',
    category: 'AI & Generation',
    description: 'Conversational AI tutor for doubts, formulas, step-by-step math, and reactions.',
    affectedButtons: ['"Ask AI Tutor"', '"NCERT AI Mentor"', '"Chat View"'],
    defaultMessage: 'The AI Study Tutor is temporarily unavailable for scheduled model updates. Please try again shortly.'
  },
  {
    key: 'ocr_scan',
    name: 'OCR Notes & Handwriting Scanner',
    category: 'Input & Media',
    description: 'AI vision extraction from uploaded notebook photos and scanned exam sheets.',
    affectedButtons: ['"Scan Notes Photo"', '"Upload Document"'],
    defaultMessage: 'Handwriting and photo OCR scanner is temporarily in maintenance mode. You can paste study text directly.'
  },
  {
    key: 'multiplayer',
    name: 'Live Multiplayer Quiz Arena',
    category: 'Social & Competition',
    description: 'Real-time competitive multiplayer battles and room code lobbies.',
    affectedButtons: ['"Host Battle"', '"Join Battle"', '"Quiz Arena"'],
    defaultMessage: 'Multiplayer Arena is temporarily paused for matchmaking server maintenance. Single-player study quizzes remain fully active.'
  },
  {
    key: 'curriculum',
    name: 'NCERT Curriculum Explorer',
    category: 'Study & Revision',
    description: 'Complete directory of 2026-27 rationalized textbook syllabi for Classes 1 to 12.',
    affectedButtons: ['"Curriculum"', '"Explore NCERT Syllabus"'],
    defaultMessage: 'The Curriculum Explorer is undergoing scheduled database maintenance.'
  },
  {
    key: 'flashcards',
    name: 'Exam Revision Flashcards',
    category: 'Study & Revision',
    description: 'Spaced-repetition revision cards for terms, laws, and key definitions.',
    affectedButtons: ['"Flashcards"', '"Revision Cards"'],
    defaultMessage: 'Flashcard revision engine is currently undergoing maintenance.'
  },
  {
    key: 'leaderboard',
    name: 'Scholar Leaderboard & Ranks',
    category: 'Social & Competition',
    description: 'Global and subject-specific scholar scoreboards and rankings.',
    affectedButtons: ['"Leaderboard"', '"View Rankings"'],
    defaultMessage: 'Leaderboard score recalculation is in progress.'
  },
  {
    key: 'feedback_submit',
    name: 'Feedback & Bug Report System',
    category: 'Input & Media',
    description: 'Student bug reporting and feature suggestion dispatch.',
    affectedButtons: ['"Report Feedback"', '"Submit Bug"'],
    defaultMessage: 'Feedback submission is temporarily offline for ticket processing.'
  }
];

export interface MaintenanceConfig {
  isActive: boolean; // Global platform killswitch
  message?: string;
  enabledAt?: string;
  enabledBy?: string;
  estimatedDuration?: string;
  features?: Partial<Record<FeatureKey, FeatureMaintenanceConfig>>;
}

export type FeedbackCategory = 'bug' | 'content_error' | 'feature_request' | 'general';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackStatus = 'open' | 'under_review' | 'resolved' | 'closed';

export interface UserFeedback {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string | null;
  userPhoto?: string | null;
  category: FeedbackCategory;
  title: string;
  description: string;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  createdAt: string;
  timestamp: number;
  timeIST: string;
  date: string;
  relatedSubject?: string;
  relatedClass?: string;
  deviceInfo?: string;
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type SecurityIncidentType =
  | 'admin_brute_force'
  | 'admin_injection_attempt'
  | 'ssrf_probe'
  | 'exam_tab_switch_anomaly'
  | 'exam_bot_speed_anomaly'
  | 'score_tamper_attempt'
  | 'chat_spam_flood'
  | 'chat_xss_probe'
  | 'challenge_code_bruteforce'
  | 'payload_oversize_abuse'
  | 'client_tamper_general';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';
export type SecurityStatus = 'unreviewed' | 'investigating' | 'resolved' | 'dismissed';

export interface SecurityIncident {
  id: string;
  type: SecurityIncidentType;
  title: string;
  description: string;
  severity: SecuritySeverity;
  status: SecurityStatus;
  timestamp: number;
  timeIST: string;
  date: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  endpointOrContext?: string;
  detectedPayload?: string;
  clientInfo?: {
    userAgent?: string;
    pathname?: string;
    screenResolution?: string;
    onlineStatus?: boolean;
  };
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export enum AppState {
  HOME = 'HOME',
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  CURRICULUM = 'CURRICULUM',
  HISTORY = 'HISTORY',
  SAVED_QUIZZES = 'SAVED_QUIZZES',
  LEADERBOARD = 'LEADERBOARD',
  CHAT = 'CHAT',
  ADMIN = 'ADMIN',
  SHARED_PREVIEW = 'SHARED_PREVIEW',
  MAINTENANCE = 'MAINTENANCE'
}



