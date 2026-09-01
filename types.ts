
export type SyllabusYear = '2026-27' | '2025-26';

export interface NCERTEntry {
  subjectName: string;
  className: string;
  chapterName: string;
  syllabusYear?: SyllabusYear;
  textbookName?: string;
}

export interface QuizConfig {
  class: string;
  subject: string;
  topics: string[];
  strength: 'Easy' | 'Medium' | 'Hard';
  quantity: number;
  timeLimitMinutes?: number; // 0 = untimed
  syllabusYear?: SyllabusYear;
  questionType?: 'single' | 'multiple' | 'both';
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
}

export interface GeminiChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  subjectContext?: string;
  classContext?: string;
  reactions?: Record<string, number>; // emoji -> count
}

export interface MaintenanceConfig {
  isActive: boolean;
  message?: string;
  enabledAt?: string;
  enabledBy?: string;
  estimatedDuration?: string;
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



