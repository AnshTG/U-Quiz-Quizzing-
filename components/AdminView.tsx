import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserProfile, 
  QuizResultRecord, 
  SavedQuizRecord, 
  SharedQuiz,
  AttendanceRecord,
  AppState,
  MaintenanceConfig,
  ChatMessage,
  AdminUserQuizEntry,
  UserFeedback,
  FeedbackCategory,
  FeedbackSeverity,
  FeedbackStatus
} from '../types';
import { 
  fetchAllUsersForAdmin, 
  fetchUserHistoryForAdmin, 
  fetchUserSavedQuizzesForAdmin,
  fetchAllSharedQuizzesForAdmin,
  fetchAllQuizzesAcrossUsersForAdmin,
  subscribeToAllQuizzesForAdmin,
  adminDeleteUserQuizAttempt,
  deleteSharedQuizByAdmin,
  subscribeToAllUsersForAdmin,
  subscribeToSharedQuizzesForAdmin,
  subscribeToAttendance,
  fetchAllAttendanceForAdmin,
  adminDeleteUserQuizResult,
  adminUpdateUserQuizResult,
  adminDeleteAllUserQuizHistory,
  adminUpdateUserProfile,
  adminDeleteUser,
  adminDeleteAllUsers,
  adminDeleteAttendanceRecord,
  adminDeleteAllAttendanceRecords,
  adminDeleteAllSharedQuizzes,
  adminDeleteAllPublicChatMessages,
  adminResetAllLeaderboards,
  adminBanUser,
  listenToPublicChat,
  deletePublicChatMessage,
  listenToMaintenanceMode,
  updateMaintenanceMode,
  listenToAllFeedbacksForAdmin,
  adminUpdateFeedbackStatus,
  adminDeleteFeedback,
  adminDeleteAllFeedbacks,
  adminPurgeResolvedFeedbacks,
  getISTDateString,
  getISTTimeString
} from '../services/firebase';
import { MathText } from './MathText';
import { 
  Users, 
  TrendingUp, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  LogOut, 
  Clock, 
  Database, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Eye, 
  Trash2, 
  Sparkles, 
  Lock,
  ArrowLeft,
  Calendar,
  Layers,
  BarChart3,
  Flame,
  UserCheck,
  CalendarCheck,
  Radio,
  Filter,
  Edit3,
  Save,
  Check,
  AlertTriangle,
  Power,
  Server,
  MessageSquare,
  Mail,
  ShieldAlert,
  Sliders,
  X,
  Plus,
  Bug,
  HelpCircle,
  LifeBuoy,
  RotateCw,
  Globe,
  ExternalLink
} from 'lucide-react';

interface AdminViewProps {
  onExitAdmin: () => void;
  onEnterMainWebsite?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onExitAdmin, onEnterMainWebsite }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'scholars' | 'quizzes' | 'shared' | 'feedback' | 'chat' | 'godmode'>('attendance');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sharedQuizzes, setSharedQuizzes] = useState<SharedQuiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<AdminUserQuizEntry[]>([]);
  const [isLoadingAllQuizzes, setIsLoadingAllQuizzes] = useState<boolean>(false);
  const [quizViewMode, setQuizViewMode] = useState<'all' | 'by_user'>('all');
  const [quizSortBy, setQuizSortBy] = useState<'date' | 'score' | 'subject' | 'user'>('date');
  const [quizSubjectFilter, setQuizSubjectFilter] = useState<string>('all');
  const [quizClassFilter, setQuizClassFilter] = useState<string>('all');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Feedback & Bug Reports State
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | FeedbackStatus>('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<'all' | FeedbackCategory>('all');
  const [feedbackSeverityFilter, setFeedbackSeverityFilter] = useState<'all' | FeedbackSeverity>('all');
  const [selectedFeedbackForDetails, setSelectedFeedbackForDetails] = useState<UserFeedback | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState<string>('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  
  // Action Loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Selected user for deep dive modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState<QuizResultRecord[]>([]);
  const [selectedUserSavedQuizzes, setSelectedUserSavedQuizzes] = useState<SavedQuizRecord[]>([]);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState<boolean>(false);

  // Selected quiz attempt for detail inspection
  const [inspectingQuizRecord, setInspectingQuizRecord] = useState<QuizResultRecord | null>(null);

  // Score editing state for individual result
  const [editingResult, setEditingResult] = useState<QuizResultRecord | null>(null);
  const [editScoreVal, setEditScoreVal] = useState<number>(0);
  const [editTotalVal, setEditTotalVal] = useState<number>(0);

  // User stats editing state
  const [isEditingUserStats, setIsEditingUserStats] = useState<boolean>(false);
  const [editUserName, setEditUserName] = useState<string>('');
  const [editUserEmail, setEditUserEmail] = useState<string>('');
  const [editTotalScore, setEditTotalScore] = useState<number>(0);
  const [editQuizzesCount, setEditQuizzesCount] = useState<number>(0);
  const [editQuestionsCount, setEditQuestionsCount] = useState<number>(0);
  const [editStreak, setEditStreak] = useState<number>(1);

  // Maintenance mode state
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>({ isActive: false });
  const [customMaintenanceMsg, setCustomMaintenanceMsg] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<string>('');

  const todayIST = getISTDateString();

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const loadAllQuizzes = async () => {
    setIsLoadingAllQuizzes(true);
    try {
      const records = await fetchAllQuizzesAcrossUsersForAdmin();
      setAllQuizzes(records);
    } catch (err) {
      console.error('Failed to load all quizzes:', err);
    } finally {
      setIsLoadingAllQuizzes(false);
    }
  };

  const refreshAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersList, quizzesList, attendanceList] = await Promise.allSettled([
        fetchAllUsersForAdmin(),
        fetchAllQuizzesAcrossUsersForAdmin(),
        fetchAllAttendanceForAdmin()
      ]);
      if (usersList.status === 'fulfilled') setUsers(usersList.value);
      if (quizzesList.status === 'fulfilled') setAllQuizzes(quizzesList.value);
      if (attendanceList.status === 'fulfilled') setAttendanceRecords(attendanceList.value);
      showToast('Admin data refreshed from cloud.');
    } catch (e) {
      console.warn('Manual refresh notice:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time subscriptions & Initial Hydration
  useEffect(() => {
    setIsLoading(true);

    const unsubUsers = subscribeToAllUsersForAdmin((liveUsers) => {
      setUsers(liveUsers);
      setIsLoading(false);
    });

    const unsubShared = subscribeToSharedQuizzesForAdmin((liveShared) => {
      setSharedQuizzes(liveShared);
    });

    const unsubAttendance = subscribeToAttendance((records) => {
      if (records && records.length > 0) {
        setAttendanceRecords(records);
      }
    });

    const unsubQuizzes = subscribeToAllQuizzesForAdmin((records) => {
      if (records) {
        setAllQuizzes(records);
      }
    });

    const unsubChat = listenToPublicChat((msgs) => {
      setChatMessages(msgs);
    });

    const unsubFeedbacks = listenToAllFeedbacksForAdmin((liveFeedbacks) => {
      setFeedbacks(liveFeedbacks);
    });

    const unsubMaintenance = listenToMaintenanceMode((config) => {
      setMaintenanceConfig(config);
      if (config.message && !customMaintenanceMsg) setCustomMaintenanceMsg(config.message);
      if (config.estimatedDuration && !estimatedDuration) setEstimatedDuration(config.estimatedDuration);
    });

    // Initial direct fetches to ensure instant display
    loadAllQuizzes();
    fetchAllAttendanceForAdmin().then(recs => {
      if (recs && recs.length > 0) setAttendanceRecords(recs);
    }).catch(console.warn);

    return () => {
      unsubUsers();
      unsubShared();
      unsubAttendance();
      unsubQuizzes();
      unsubChat();
      unsubFeedbacks();
      unsubMaintenance();
    };
  }, []);

  // Filtered Attendance List
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => {
      // Date filter
      if (attendanceDateFilter && record.date !== attendanceDateFilter) {
        return false;
      }
      // Activity filter
      if (selectedActivityFilter !== 'all' && record.activityType !== selectedActivityFilter) {
        return false;
      }
      // Search query (name, email, subject, user ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = record.displayName?.toLowerCase().includes(q);
        const matchesEmail = record.email?.toLowerCase().includes(q);
        const matchesSubject = record.subjectAttempted?.toLowerCase().includes(q);
        const matchesId = record.userId?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesSubject && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [attendanceRecords, attendanceDateFilter, selectedActivityFilter, searchQuery]);

  // Filtered Scholars List
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => 
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Filtered Shared Quizzes
  const filteredSharedQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return sharedQuizzes;
    const q = searchQuery.toLowerCase();
    return sharedQuizzes.filter(sq => 
      sq.title?.toLowerCase().includes(q) ||
      sq.id.toLowerCase().includes(q) ||
      sq.creatorName?.toLowerCase().includes(q) ||
      sq.config?.subject?.toLowerCase().includes(q)
    );
  }, [sharedQuizzes, searchQuery]);

  // Filtered Chat Messages
  const filteredChatMessages = useMemo(() => {
    if (!searchQuery.trim()) return chatMessages;
    const q = searchQuery.toLowerCase();
    return chatMessages.filter(cm => 
      cm.message?.toLowerCase().includes(q) ||
      cm.userName?.toLowerCase().includes(q) ||
      cm.subjectTag?.toLowerCase().includes(q)
    );
  }, [chatMessages, searchQuery]);

  // Filtered & Sorted Quizzes Across All Users
  const filteredAndSortedQuizzes = useMemo(() => {
    let list = [...allQuizzes];
    if (quizSubjectFilter !== 'all') {
      list = list.filter(q => (q.subject || q.config?.subject || '').toLowerCase() === quizSubjectFilter.toLowerCase());
    }
    if (quizClassFilter !== 'all') {
      list = list.filter(q => (q.class || q.config?.class || '').toLowerCase() === quizClassFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        (item.subject || item.config?.subject || '').toLowerCase().includes(q) ||
        (item.class || item.config?.class || '').toLowerCase().includes(q) ||
        (item.topics || item.config?.topics || []).some(t => t.toLowerCase().includes(q)) ||
        item.userDisplayName?.toLowerCase().includes(q) ||
        item.userEmail?.toLowerCase().includes(q) ||
        item.userId?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (quizSortBy === 'score') {
        const pctA = a.total > 0 ? (a.score / a.total) : 0;
        const pctB = b.total > 0 ? (b.score / b.total) : 0;
        return pctB - pctA;
      }
      if (quizSortBy === 'subject') {
        return (a.subject || '').localeCompare(b.subject || '');
      }
      if (quizSortBy === 'user') {
        return (a.userDisplayName || a.userId || '').localeCompare(b.userDisplayName || b.userId || '');
      }
      // date (newest first)
      const tA = a.timestamp || new Date(a.date).getTime() || 0;
      const tB = b.timestamp || new Date(b.date).getTime() || 0;
      return tB - tA;
    });

    return list;
  }, [allQuizzes, quizSubjectFilter, quizClassFilter, searchQuery, quizSortBy]);

  // Quizzes Grouped by Scholar
  const quizzesGroupedByUser = useMemo(() => {
    const map = new Map<string, {
      userId: string;
      displayName: string;
      email?: string;
      photo?: string;
      quizzes: AdminUserQuizEntry[];
      totalScore: number;
      totalQuestions: number;
      avgAccuracy: number;
    }>();

    filteredAndSortedQuizzes.forEach(quiz => {
      const uid = quiz.userId || 'anonymous';
      if (!map.has(uid)) {
        const matchedUser = users.find(u => u.uid === uid);
        map.set(uid, {
          userId: uid,
          displayName: quiz.userDisplayName || matchedUser?.displayName || `Scholar ${uid.substring(0, 5)}`,
          email: quiz.userEmail || matchedUser?.email || undefined,
          photo: quiz.userPhoto || matchedUser?.photoURL || undefined,
          quizzes: [],
          totalScore: 0,
          totalQuestions: 0,
          avgAccuracy: 0
        });
      }
      const group = map.get(uid)!;
      group.quizzes.push(quiz);
      group.totalScore += quiz.score || 0;
      group.totalQuestions += quiz.total || 0;
    });

    const result = Array.from(map.values()).map(g => ({
      ...g,
      avgAccuracy: g.totalQuestions > 0 ? Math.round((g.totalScore / g.totalQuestions) * 100) : 0
    }));

    result.sort((a, b) => b.quizzes.length - a.quizzes.length);
    return result;
  }, [filteredAndSortedQuizzes, users]);

  // Filtered Feedbacks List
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      if (feedbackStatusFilter !== 'all' && item.status !== feedbackStatusFilter) {
        return false;
      }
      if (feedbackCategoryFilter !== 'all' && item.category !== feedbackCategoryFilter) {
        return false;
      }
      if (feedbackSeverityFilter !== 'all' && item.severity !== feedbackSeverityFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUser = item.userDisplayName?.toLowerCase().includes(q);
        const matchesEmail = item.userEmail?.toLowerCase().includes(q);
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesSubject = item.relatedSubject?.toLowerCase().includes(q);
        const matchesClass = item.relatedClass?.toLowerCase().includes(q);
        if (!matchesUser && !matchesEmail && !matchesTitle && !matchesDesc && !matchesSubject && !matchesClass) {
          return false;
        }
      }
      return true;
    });
  }, [feedbacks, feedbackStatusFilter, feedbackCategoryFilter, feedbackSeverityFilter, searchQuery]);

  // Handle Maintenance Toggle
  const handleToggleMaintenance = async (targetActive: boolean) => {
    const confirmPrompt = targetActive 
      ? '🚨 ACTIVATE Platform Maintenance Mode? All non-admin users will immediately be blocked from quizzes, chat, and assessment features.' 
      : '✅ DEACTIVATE Maintenance Mode and restore full public access for all scholars?';

    if (!window.confirm(confirmPrompt)) return;
    
    setActionLoading('maintenance');
    try {
      await updateMaintenanceMode({
        isActive: targetActive,
        message: customMaintenanceMsg.trim() || 'U-Quiz is currently undergoing scheduled platform upgrades to improve syllabus accuracy, speed, and real-time assessment capabilities.',
        estimatedDuration: estimatedDuration.trim() || 'Brief maintenance',
        enabledAt: new Date().toISOString(),
        enabledBy: 'Admin Portal'
      });
      showToast(targetActive ? 'Platform Maintenance Mode ACTIVATED.' : 'Platform Maintenance Mode DEACTIVATED.');
    } catch (err) {
      alert('Failed to update maintenance mode.');
    } finally {
      setActionLoading(null);
    }
  };

  // Inspect single user progress & history
  const handleInspectUser = async (u: UserProfile) => {
    setSelectedUser(u);
    setIsLoadingUserDetails(true);
    setInspectingQuizRecord(null);
    setEditingResult(null);
    setIsEditingUserStats(false);
    setEditUserName(u.displayName || '');
    setEditUserEmail(u.email || '');
    setEditTotalScore(u.totalScore || 0);
    setEditQuizzesCount(u.quizzesCompleted || 0);
    setEditQuestionsCount(u.totalQuestionsAnswered || 0);
    setEditStreak(u.currentStreak || 1);

    try {
      const [history, savedQuizzes] = await Promise.all([
        fetchUserHistoryForAdmin(u.uid),
        fetchUserSavedQuizzesForAdmin(u.uid)
      ]);
      setSelectedUserHistory(history);
      setSelectedUserSavedQuizzes(savedQuizzes);
    } catch (e) {
      console.error('Failed to fetch user details:', e);
    } finally {
      setIsLoadingUserDetails(false);
    }
  };

  // Delete Individual User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE scholar "${userName}" (${userId}) and all associated records?`)) {
      return;
    }
    setActionLoading(`delete_user_${userId}`);
    try {
      await adminDeleteUser(userId);
      if (selectedUser?.uid === userId) {
        setSelectedUser(null);
      }
      showToast(`Scholar "${userName}" was permanently removed.`);
    } catch (err) {
      alert('Failed to delete scholar.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete All Users
  const handleDeleteAllUsers = async () => {
    const confirmation = window.prompt(
      '⚠️ DANGER: You are about to DELETE ALL REGISTERED USERS and their entire history across the system! Type "DELETE ALL USERS" to confirm:'
    );
    if (confirmation !== 'DELETE ALL USERS') {
      alert('Action cancelled: Confirmation text did not match.');
      return;
    }
    setActionLoading('delete_all_users');
    try {
      const count = await adminDeleteAllUsers();
      setSelectedUser(null);
      showToast(`Successfully purged all ${count} scholar accounts.`);
    } catch (err) {
      alert('Failed to delete all users.');
    } finally {
      setActionLoading(null);
    }
  };

  // Ban or Unban Scholar
  const handleBanToggle = async (userId: string, currentBanned: boolean, userName: string) => {
    let reason: string | undefined;
    if (!currentBanned) {
      const inputReason = window.prompt(`Enter ban reason for scholar "${userName}":`, 'Violating academic code / spam');
      if (inputReason === null) return;
      reason = inputReason.trim() || 'Administrative suspension';
    } else {
      if (!window.confirm(`Are you sure you want to UNBAN scholar "${userName}"?`)) return;
    }

    setActionLoading(`ban_${userId}`);
    try {
      await adminBanUser(userId, !currentBanned, reason);
      showToast(`Scholar "${userName}" was ${currentBanned ? 'UNBANNED' : 'BANNED'}.`);
      if (selectedUser?.uid === userId) {
        setSelectedUser(prev => prev ? { 
          ...prev, 
          isBanned: !currentBanned, 
          banReason: reason, 
          bannedAt: !currentBanned ? new Date().toISOString() : undefined 
        } : null);
      }
    } catch (e) {
      alert('Failed to update ban status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Individual Attendance Record
  const handleDeleteAttendanceRecord = async (recordId: string) => {
    if (!window.confirm('Delete this attendance entry?')) return;
    try {
      await adminDeleteAttendanceRecord(recordId);
      showToast('Attendance record deleted.');
    } catch (e) {
      alert('Failed to delete attendance record.');
    }
  };

  // Delete All Attendance Records
  const handleDeleteAllAttendance = async () => {
    const confirmation = window.prompt(
      '⚠️ DANGER: Are you sure you want to PURGE ALL ATTENDANCE LOGS? Type "PURGE ATTENDANCE" to confirm:'
    );
    if (confirmation !== 'PURGE ATTENDANCE') {
      alert('Action cancelled: Confirmation text did not match.');
      return;
    }
    setActionLoading('delete_all_attendance');
    try {
      const count = await adminDeleteAllAttendanceRecords();
      showToast(`Purged ${count} attendance records from database.`);
    } catch (err) {
      alert('Failed to delete all attendance records.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Individual Shared Quiz
  const handleDeleteSharedQuiz = async (quizId: string) => {
    if (!window.confirm(`Delete shared challenge quiz #${quizId}?`)) return;
    setActionLoading(`delete_shared_${quizId}`);
    try {
      await deleteSharedQuizByAdmin(quizId);
      setSharedQuizzes(prev => prev.filter(q => q.id !== quizId));
      showToast(`Shared quiz #${quizId} deleted.`);
    } catch (err) {
      console.error('Delete shared quiz error:', err);
      alert('Failed to delete shared quiz.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete All Shared Quizzes
  const handleDeleteAllSharedQuizzes = async () => {
    const confirmation = window.prompt(
      '⚠️ DANGER: You are about to DELETE ALL COMMUNITY SHARED QUIZZES! Type "DELETE ALL SHARED" to confirm:'
    );
    if (confirmation !== 'DELETE ALL SHARED') {
      alert('Action cancelled.');
      return;
    }
    setActionLoading('delete_all_shared');
    try {
      const count = await adminDeleteAllSharedQuizzes();
      setSharedQuizzes([]);
      showToast(`Purged ${count} shared challenge quizzes.`);
    } catch (err) {
      alert('Failed to delete all shared quizzes.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Individual Quiz Attempt in Quizzes view
  const handleDeleteQuizAttempt = async (quiz: AdminUserQuizEntry) => {
    if (!quiz.userId) {
      alert('Cannot delete: Missing user ID for this quiz attempt.');
      return;
    }
    if (!window.confirm(`Delete ${quiz.subject} quiz result (${quiz.score}/${quiz.total}) for ${quiz.userDisplayName || quiz.userId}?`)) {
      return;
    }
    setActionLoading(`delete_quiz_${quiz.id}`);
    try {
      await adminDeleteUserQuizAttempt(quiz.userId, quiz.id);
      setAllQuizzes(prev => prev.filter(q => q.id !== quiz.id));
      setSelectedUserHistory(prev => prev.filter(q => q.id !== quiz.id));
      showToast('Quiz assessment record deleted.');
    } catch (err) {
      console.error('Delete quiz attempt error:', err);
      alert('Failed to delete quiz attempt.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Individual Chat Message
  const handleDeleteChatMessage = async (msgId: string) => {
    if (!window.confirm('Delete this chat message?')) return;
    setActionLoading(`delete_msg_${msgId}`);
    try {
      await deletePublicChatMessage(msgId);
      setChatMessages(prev => prev.filter(m => m.id !== msgId));
      showToast('Chat message deleted.');
    } catch (e) {
      alert('Failed to delete message.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete All Chat Messages
  const handleDeleteAllChatMessages = async () => {
    const confirmation = window.prompt(
      '⚠️ DANGER: You are about to PURGE ALL PUBLIC CHAT MESSAGES! Type "CLEAR ALL CHAT" to confirm:'
    );
    if (confirmation !== 'CLEAR ALL CHAT') {
      alert('Action cancelled.');
      return;
    }
    setActionLoading('delete_all_chat');
    try {
      const count = await adminDeleteAllPublicChatMessages();
      showToast(`Cleared ${count} public chat messages.`);
    } catch (err) {
      alert('Failed to clear public chat.');
    } finally {
      setActionLoading(null);
    }
  };

  // Feedback: Update Status & Admin Notes
  const handleUpdateFeedbackStatus = async (
    feedbackId: string, 
    status: FeedbackStatus, 
    notes?: string
  ) => {
    setActionLoading(`fb_status_${feedbackId}`);
    try {
      await adminUpdateFeedbackStatus(feedbackId, status, notes);
      setFeedbacks(prev => prev.map(f => f.id === feedbackId ? {
        ...f,
        status,
        adminNotes: notes !== undefined ? notes : f.adminNotes,
        resolvedAt: status === 'resolved' ? new Date().toISOString() : f.resolvedAt
      } : f));
      if (selectedFeedbackForDetails?.id === feedbackId) {
        setSelectedFeedbackForDetails(prev => prev ? {
          ...prev,
          status,
          adminNotes: notes !== undefined ? notes : prev.adminNotes,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : prev.resolvedAt
        } : null);
      }
      showToast(`Ticket status updated to "${status.toUpperCase()}".`);
    } catch (e) {
      console.error('Update feedback status error:', e);
      alert('Failed to update ticket status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Feedback: Delete Single Report
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Delete this feedback/bug report ticket?')) return;
    setActionLoading(`delete_fb_${feedbackId}`);
    try {
      await adminDeleteFeedback(feedbackId);
      setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
      if (selectedFeedbackForDetails?.id === feedbackId) {
        setSelectedFeedbackForDetails(null);
      }
      showToast('Feedback ticket removed.');
    } catch (e) {
      console.error('Delete feedback error:', e);
      alert('Failed to delete feedback ticket.');
    } finally {
      setActionLoading(null);
    }
  };

  // Feedback: Purge Resolved Reports
  const handlePurgeResolvedFeedbacks = async () => {
    if (!window.confirm('Are you sure you want to delete all RESOLVED and CLOSED feedback tickets?')) return;
    setActionLoading('purge_resolved_fb');
    try {
      const count = await adminPurgeResolvedFeedbacks();
      setFeedbacks(prev => prev.filter(f => f.status !== 'resolved' && f.status !== 'closed'));
      showToast(`Purged ${count} resolved feedback tickets.`);
    } catch (e) {
      alert('Failed to purge resolved feedbacks.');
    } finally {
      setActionLoading(null);
    }
  };

  // Feedback: Delete All Feedbacks
  const handleDeleteAllFeedbacks = async () => {
    const confirmation = window.prompt(
      '⚠️ DANGER: You are about to DELETE ALL FEEDBACK & BUG REPORTS! Type "PURGE ALL FEEDBACK" to confirm:'
    );
    if (confirmation !== 'PURGE ALL FEEDBACK') {
      alert('Action cancelled.');
      return;
    }
    setActionLoading('delete_all_feedbacks');
    try {
      const count = await adminDeleteAllFeedbacks();
      setFeedbacks([]);
      setSelectedFeedbackForDetails(null);
      showToast(`Purged all ${count} feedback reports.`);
    } catch (e) {
      alert('Failed to delete all feedbacks.');
    } finally {
      setActionLoading(null);
    }
  };

  // Reset Leaderboards
  const handleResetLeaderboards = async () => {
    const confirmation = window.prompt(
      '⚠️ Reset all leaderboard scores and statistics for all scholars to 0? Type "RESET LEADERBOARDS" to proceed:'
    );
    if (confirmation !== 'RESET LEADERBOARDS') {
      alert('Action cancelled.');
      return;
    }
    setActionLoading('reset_leaderboards');
    try {
      const count = await adminResetAllLeaderboards();
      showToast(`Successfully reset leaderboard stats for ${count} scholars.`);
    } catch (err) {
      alert('Failed to reset leaderboards.');
    } finally {
      setActionLoading(null);
    }
  };

  // Save User Profile Stats (God-Mode Edit)
  const handleSaveUserStats = async () => {
    if (!selectedUser) return;
    setActionLoading('save_user_stats');
    try {
      await adminUpdateUserProfile(selectedUser.uid, {
        displayName: editUserName.trim() || selectedUser.displayName,
        totalScore: Number(editTotalScore),
        quizzesCompleted: Number(editQuizzesCount),
        totalQuestionsAnswered: Number(editQuestionsCount),
        currentStreak: Number(editStreak)
      });
      setIsEditingUserStats(false);
      showToast(`Updated profile and statistics for ${editUserName || 'scholar'}.`);
    } catch (err) {
      alert('Failed to update scholar stats.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete User Quiz Attempt
  const handleDeleteUserAttempt = async (resultId: string) => {
    if (!selectedUser) return;
    if (!window.confirm('Delete this quiz score record?')) return;
    try {
      await adminDeleteUserQuizResult(selectedUser.uid, resultId);
      setSelectedUserHistory(prev => prev.filter(r => r.id !== resultId));
      showToast('Quiz attempt record deleted.');
    } catch (e) {
      alert('Failed to delete attempt.');
    }
  };

  // Edit Quiz Result Score
  const handleSaveAttemptScore = async () => {
    if (!selectedUser || !editingResult) return;
    try {
      await adminUpdateUserQuizResult(selectedUser.uid, editingResult.id, {
        score: editScoreVal,
        total: editTotalVal
      });
      setSelectedUserHistory(prev => prev.map(r => r.id === editingResult.id ? { ...r, score: editScoreVal, total: editTotalVal } : r));
      setEditingResult(null);
      showToast('Score updated successfully.');
    } catch (e) {
      alert('Failed to update score.');
    }
  };

  // Delete All Quiz History for Selected User
  const handleDeleteAllHistoryForUser = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Delete ALL quiz history records for ${selectedUser.displayName || 'this scholar'}?`)) return;
    try {
      const count = await adminDeleteAllUserQuizHistory(selectedUser.uid);
      setSelectedUserHistory([]);
      showToast(`Deleted ${count} quiz attempts.`);
    } catch (e) {
      alert('Failed to delete user quiz history.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-12">
      
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Header & Admin HUD */}
      <div className="rounded-3xl border border-amber-500/30 bg-slate-900/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                Admin Control Center
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                Full Power Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Cloud Database • Direct Scholar Management • Universal Delete Powers • No Stored Caching
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {onEnterMainWebsite && (
            <button
              onClick={onEnterMainWebsite}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
              title="Open and browse the main website with administrator bypass privileges"
            >
              <Globe className="w-4 h-4" />
              <span>Enter Main Website</span>
            </button>
          )}

          <button
            onClick={refreshAllAdminData}
            disabled={isLoading || isLoadingAllQuizzes}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh All Database Records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isLoadingAllQuizzes ? 'animate-spin' : ''}`} />
            <span>Sync Cloud Data</span>
          </button>

          <button
            onClick={() => {
              // Lock admin immediately on exit
              onExitAdmin();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock & Exit Portal</span>
          </button>
        </div>
      </div>

      {/* Maintenance Mode Active Banner for Admin */}
      {maintenanceConfig.isActive && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-300 shadow-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Maintenance Mode is Active Globally</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono uppercase">
                  Scholars Blocked
                </span>
              </h4>
              <p className="text-[11px] text-amber-300/80">
                Regular students are seeing the Maintenance screen. You can enter and test all features of the main website with administrator bypass.
              </p>
            </div>
          </div>
          {onEnterMainWebsite && (
            <button
              onClick={onEnterMainWebsite}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Enter Main Website (Bypass)</span>
            </button>
          )}
        </div>
      )}

      {/* Quick Overview Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Scholars</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {users.length}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Google Signed-in</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Attendance Today</span>
            <CalendarCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-teal-400">
            {attendanceRecords.filter(r => r.date === todayIST).length}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{attendanceRecords.length} Total Logs</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Shared Quizzes</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400">
            {sharedQuizzes.length}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Active Challenge Vault</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Maintenance Mode</span>
            <Power className={`w-4 h-4 ${maintenanceConfig.isActive ? 'text-rose-400' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${maintenanceConfig.isActive ? 'text-rose-400' : 'text-emerald-400'}`}>
            {maintenanceConfig.isActive ? 'ACTIVE' : 'OFF'}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Global Gate State</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance Logs</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[10px] font-mono">
              {attendanceRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('scholars')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'scholars'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Scholars & Accounts</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[10px] font-mono">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('quizzes');
              loadAllQuizzes();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>All Assessments</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[10px] font-mono">
              {allQuizzes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('shared')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'shared'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Shared Challenges</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[10px] font-mono">
              {sharedQuizzes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bug className="w-4 h-4 text-rose-400 group-hover:text-white" />
            <span>Feedback & Bugs</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[10px] font-mono">
              {feedbacks.length}
            </span>
            {feedbacks.filter(f => f.status === 'open').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Public Chat</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[10px] font-mono">
              {chatMessages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('godmode')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'godmode'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>God-Mode Controls</span>
          </button>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ===================== TAB 1: ATTENDANCE LOGS ===================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          
          {/* Attendance Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-teal-400" />
                <span>Date Filter:</span>
              </span>

              <button
                onClick={() => setAttendanceDateFilter('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  attendanceDateFilter === ''
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Dates
              </button>

              <button
                onClick={() => setAttendanceDateFilter(todayIST)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  attendanceDateFilter === todayIST
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Today ({todayIST})
              </button>

              <input
                type="date"
                value={attendanceDateFilter}
                onChange={(e) => setAttendanceDateFilter(e.target.value)}
                className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-400"
              />

              <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

              {/* Activity Type Filter */}
              <select
                value={selectedActivityFilter}
                onChange={(e) => setSelectedActivityFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-400"
              >
                <option value="all">All Activities</option>
                <option value="manual_checkin">Manual Check-in</option>
                <option value="quiz_completion">Quiz Completion</option>
                <option value="daily_login">Daily Login</option>
              </select>
            </div>

            {/* Delete All Attendance Button */}
            <button
              onClick={handleDeleteAllAttendance}
              disabled={actionLoading === 'delete_all_attendance' || attendanceRecords.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Attendance</span>
            </button>
          </div>

          {/* Records Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Showing {filteredAttendance.length} of {attendanceRecords.length} Attendance Records</span>
              {attendanceDateFilter && (
                <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
                  Filtered by Date: {attendanceDateFilter}
                </span>
              )}
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No attendance entries match this filter</p>
                <p className="text-xs text-slate-500">Try clearing the date filter or searching for another student.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Scholar & Email</th>
                      <th className="px-4 py-3">Date (IST)</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Activity Type</th>
                      <th className="px-4 py-3">Streak</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {rec.photoURL ? (
                              <img 
                                src={rec.photoURL} 
                                alt={rec.displayName}
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0" 
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold shrink-0">
                                {rec.displayName ? rec.displayName.charAt(0) : 'U'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{rec.displayName || 'Scholar'}</div>
                              <div className="text-[11px] text-slate-400 font-mono truncate">{rec.email || 'No email provided'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                          {rec.date}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          {rec.timeStr || new Date(rec.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            rec.activityType === 'quiz_completion'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : rec.activityType === 'manual_checkin'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}>
                            {rec.activityType === 'quiz_completion' ? `Quiz: ${rec.subjectAttempted || 'Assessment'}` : rec.activityType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-orange-400 font-bold">
                          🔥 {rec.currentStreak || 1}d
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteAttendanceRecord(rec.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete this record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ===================== TAB 2: SCHOLARS & ACCOUNTS ===================== */}
      {activeTab === 'scholars' && (
        <div className="space-y-4">
          
          {/* Header Action Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Registered Scholars Directory</h3>
              <p className="text-xs text-slate-400">Total {users.length} verified accounts logged in via Google Auth</p>
            </div>

            <button
              onClick={handleDeleteAllUsers}
              disabled={actionLoading === 'delete_all_users' || users.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Scholars</span>
            </button>
          </div>

          {/* Scholars Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No scholars found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Scholar & Avatar</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Score & Quizzes</th>
                      <th className="px-4 py-3">Streak</th>
                      <th className="px-4 py-3">Last Active</th>
                      <th className="px-4 py-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.uid} className={`hover:bg-slate-800/40 transition-colors ${u.isBanned ? 'bg-rose-950/20' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {u.photoURL ? (
                              <img 
                                src={u.photoURL} 
                                alt={u.displayName || ''} 
                                referrerPolicy="no-referrer"
                                className={`w-8 h-8 rounded-full object-cover border shrink-0 ${u.isBanned ? 'border-rose-500' : 'border-emerald-400/30'}`} 
                              />
                            ) : (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${u.isBanned ? 'bg-rose-900/50 text-rose-300' : 'bg-slate-800 text-emerald-400'}`}>
                                {u.displayName ? u.displayName.charAt(0) : 'U'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white truncate">{u.displayName || 'Google Scholar'}</span>
                                {u.isBanned && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                    BANNED
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">UID: {u.uid.substring(0, 8)}...</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-mono text-emerald-400 font-medium">
                          {u.email || 'No email attached'}
                        </td>

                        <td className="px-4 py-3">
                          {u.isBanned ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-white font-mono">{u.totalScore || 0} pts</div>
                          <div className="text-[10px] text-slate-400">{u.quizzesCompleted || 0} quizzes • {u.totalQuestionsAnswered || 0} Qs</div>
                        </td>

                        <td className="px-4 py-3 font-mono text-orange-400 font-bold">
                          🔥 {u.currentStreak || 1}d
                        </td>

                        <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Recent'}
                        </td>

                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          {/* Ban / Unban Button */}
                          <button
                            onClick={() => handleBanToggle(u.uid, !!u.isBanned, u.displayName || 'Scholar')}
                            disabled={actionLoading === `ban_${u.uid}`}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                              u.isBanned
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                            title={u.isBanned ? 'Lift Ban' : 'Ban User'}
                          >
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>

                          <button
                            onClick={() => handleInspectUser(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.uid, u.displayName || 'Scholar')}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Scholar Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ===================== TAB: ALL ASSESSMENTS & QUIZZES ===================== */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {/* Header & Controls Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white">All Assessments & Quizzes</h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
                    {filteredAndSortedQuizzes.length} Quizzes Found
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete repository of quizzes created and attempted by scholars across all classes
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={loadAllQuizzes}
                  disabled={isLoadingAllQuizzes}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  title="Reload all assessments"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAllQuizzes ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* View Mode & Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setQuizViewMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    quizViewMode === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Chronological List ({allQuizzes.length})
                </button>
                <button
                  onClick={() => setQuizViewMode('by_user')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    quizViewMode === 'by_user'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Group by Scholar ({quizzesGroupedByUser.length})
                </button>
              </div>

              {/* Filters & Sorting */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-500">Sort:</span>
                  <select
                    value={quizSortBy}
                    onChange={(e) => setQuizSortBy(e.target.value as any)}
                    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="date" className="bg-slate-900 text-white">Date (Newest)</option>
                    <option value="score" className="bg-slate-900 text-white">Score (Highest %)</option>
                    <option value="subject" className="bg-slate-900 text-white">Subject (A-Z)</option>
                    <option value="user" className="bg-slate-900 text-white">Scholar Name</option>
                  </select>
                </div>

                {/* Class Filter */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-500">Class:</span>
                  <select
                    value={quizClassFilter}
                    onChange={(e) => setQuizClassFilter(e.target.value)}
                    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900 text-white">All Classes</option>
                    <option value="Class 6" className="bg-slate-900 text-white">Class 6</option>
                    <option value="Class 7" className="bg-slate-900 text-white">Class 7</option>
                    <option value="Class 8" className="bg-slate-900 text-white">Class 8</option>
                    <option value="Class 9" className="bg-slate-900 text-white">Class 9</option>
                    <option value="Class 10" className="bg-slate-900 text-white">Class 10</option>
                  </select>
                </div>

                {/* Subject Filter */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-500">Subject:</span>
                  <select
                    value={quizSubjectFilter}
                    onChange={(e) => setQuizSubjectFilter(e.target.value)}
                    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900 text-white">All Subjects</option>
                    <option value="Science" className="bg-slate-900 text-white">Science</option>
                    <option value="Mathematics" className="bg-slate-900 text-white">Mathematics</option>
                    <option value="Social Science" className="bg-slate-900 text-white">Social Science</option>
                    <option value="Physics" className="bg-slate-900 text-white">Physics</option>
                    <option value="Chemistry" className="bg-slate-900 text-white">Chemistry</option>
                    <option value="Biology" className="bg-slate-900 text-white">Biology</option>
                    <option value="History" className="bg-slate-900 text-white">History</option>
                    <option value="Geography" className="bg-slate-900 text-white">Geography</option>
                    <option value="Civics" className="bg-slate-900 text-white">Civics</option>
                    <option value="Economics" className="bg-slate-900 text-white">Economics</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingAllQuizzes && (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
              <p className="text-sm">Fetching quizzes and assessments from database...</p>
            </div>
          )}

          {/* No Quizzes Match */}
          {!isLoadingAllQuizzes && filteredAndSortedQuizzes.length === 0 && (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Quizzes Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No quiz assessments match the selected search query or filters.
              </p>
            </div>
          )}

          {/* FLAT LIST VIEW */}
          {!isLoadingAllQuizzes && quizViewMode === 'all' && filteredAndSortedQuizzes.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      <th className="p-3.5 font-bold">Scholar</th>
                      <th className="p-3.5 font-bold">Curriculum</th>
                      <th className="p-3.5 font-bold">Topics / Description</th>
                      <th className="p-3.5 font-bold">Score & Accuracy</th>
                      <th className="p-3.5 font-bold">Date & Time</th>
                      <th className="p-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredAndSortedQuizzes.map((quiz) => {
                      const pct = quiz.total > 0 ? Math.round((quiz.score / quiz.total) * 100) : 0;
                      return (
                        <tr key={quiz.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              {quiz.userPhoto ? (
                                <img
                                  src={quiz.userPhoto}
                                  alt=""
                                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold flex items-center justify-center text-[10px]">
                                  {(quiz.userDisplayName || 'S').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate">
                                  {quiz.userDisplayName || 'Scholar'}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {quiz.userEmail || quiz.userId || 'Guest'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-200">{quiz.subject}</div>
                            <span className="inline-block px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-cyan-400 mt-0.5">
                              {quiz.class || 'NCERT'}
                            </span>
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <div className="text-slate-300 truncate">
                              {quiz.topics && quiz.topics.length > 0
                                ? quiz.topics.join(', ')
                                : `${quiz.subject} Assessment`}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {quiz.total} Questions • {quiz.strength || 'Standard'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                                  pct >= 80
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : pct >= 50
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {quiz.score} / {quiz.total} ({pct}%)
                              </span>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-[11px] text-slate-400">
                            <div>{quiz.date}</div>
                            <div className="text-[10px] text-slate-500">{quiz.timeIST || ''}</div>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {quiz.questions && quiz.questions.length > 0 && (
                                <button
                                  onClick={() => setInspectingQuizRecord(quiz)}
                                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors cursor-pointer"
                                  title="Inspect questions and rationale"
                                >
                                  Inspect
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteQuizAttempt(quiz)}
                                disabled={actionLoading === `delete_quiz_${quiz.id}`}
                                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-40"
                                title="Delete this quiz attempt"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GROUPED BY SCHOLAR VIEW */}
          {!isLoadingAllQuizzes && quizViewMode === 'by_user' && quizzesGroupedByUser.length > 0 && (
            <div className="space-y-4">
              {quizzesGroupedByUser.map((group) => (
                <div key={group.userId} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
                  {/* Scholar Summary Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      {group.photo ? (
                        <img
                          src={group.photo}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-sm">
                          {group.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                          {group.displayName}
                          <span className="px-2 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400 font-normal">
                            {group.userId}
                          </span>
                        </h4>
                        <div className="text-xs text-slate-400">{group.email || 'No email provided'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-cyan-400">
                          {group.quizzes.length} Quizzes Taken
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Avg: {group.avgAccuracy}% ({group.totalScore}/{group.totalQuestions} Qs)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scholar's Quizzes Sub-Table */}
                  <div className="space-y-2 pt-1">
                    {group.quizzes.map((quiz) => {
                      const pct = quiz.total > 0 ? Math.round((quiz.score / quiz.total) * 100) : 0;
                      return (
                        <div
                          key={quiz.id}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-950 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{quiz.subject}</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-cyan-400">
                                {quiz.class}
                              </span>
                              <span
                                className={`px-2 py-0.2 rounded text-[11px] font-mono font-bold ${
                                  pct >= 80
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : pct >= 50
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {quiz.score}/{quiz.total} ({pct}%)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 truncate">
                              {quiz.topics && quiz.topics.length > 0 ? quiz.topics.join(', ') : 'Standard Assessment'} • {quiz.date} {quiz.timeIST || ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {quiz.questions && quiz.questions.length > 0 && (
                              <button
                                onClick={() => setInspectingQuizRecord(quiz)}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Inspect Questions
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteQuizAttempt(quiz)}
                              disabled={actionLoading === `delete_quiz_${quiz.id}`}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Quiz"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: SHARED CHALLENGES ===================== */}
      {activeTab === 'shared' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Community Challenge Vault</h3>
              <p className="text-xs text-slate-400">Total {sharedQuizzes.length} public challenge quizzes created by scholars</p>
            </div>

            <button
              onClick={handleDeleteAllSharedQuizzes}
              disabled={actionLoading === 'delete_all_shared' || sharedQuizzes.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Shared Quizzes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSharedQuizzes.map((quiz) => (
              <div key={quiz.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold">
                      Code: {quiz.id}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1.5">{quiz.title}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteSharedQuiz(quiz.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <div>{quiz.config.class} • {quiz.config.subject} • {quiz.config.strength}</div>
                  <div>{quiz.questions?.length || 0} Questions • {quiz.playsCount || 0} Plays</div>
                  <div className="text-slate-500 text-[10px]">Author: {quiz.creatorName || 'Anonymous Scholar'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: FEEDBACK & BUG REPORTS ===================== */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          
          {/* Header & Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Total Reports</span>
                <Bug className="w-4 h-4 text-rose-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-white">
                {feedbacks.length}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">All Submitted Tickets</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-1 bg-rose-500/5">
              <span className="text-xs text-rose-300 font-semibold flex items-center justify-between">
                <span>Open / Pending</span>
                <Clock className="w-4 h-4 text-rose-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-rose-400">
                {feedbacks.filter(f => f.status === 'open').length}
              </div>
              <span className="text-[10px] text-rose-400/80 font-mono">Requires Triage</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-1 bg-cyan-500/5">
              <span className="text-xs text-cyan-300 font-semibold flex items-center justify-between">
                <span>Under Review</span>
                <RotateCw className="w-4 h-4 text-cyan-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {feedbacks.filter(f => f.status === 'under_review').length}
              </div>
              <span className="text-[10px] text-cyan-400/80 font-mono">Being Investigated</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1 bg-emerald-500/5">
              <span className="text-xs text-emerald-300 font-semibold flex items-center justify-between">
                <span>Resolved & Fixed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {feedbacks.filter(f => f.status === 'resolved').length}
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">Completed</span>
            </div>
          </div>

          {/* Action Bar & Filters */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-rose-400" />
                  <span>Status Filter:</span>
                </span>
                
                {(['all', 'open', 'under_review', 'resolved', 'closed'] as const).map((st) => {
                  const count = st === 'all' ? feedbacks.length : feedbacks.filter(f => f.status === st).length;
                  const isSelected = feedbackStatusFilter === st;
                  const labels: Record<string, string> = {
                    all: 'All',
                    open: 'Open',
                    under_review: 'Under Review',
                    resolved: 'Resolved',
                    closed: 'Closed'
                  };
                  return (
                    <button
                      key={st}
                      onClick={() => setFeedbackStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{labels[st]}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px] font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePurgeResolvedFeedbacks}
                  disabled={actionLoading === 'purge_resolved_fb' || feedbacks.filter(f => f.status === 'resolved' || f.status === 'closed').length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
                  title="Remove resolved & closed tickets"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Purge Resolved ({feedbacks.filter(f => f.status === 'resolved' || f.status === 'closed').length})</span>
                </button>

                <button
                  onClick={handleDeleteAllFeedbacks}
                  disabled={actionLoading === 'delete_all_feedbacks' || feedbacks.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge All</span>
                </button>
              </div>
            </div>

            {/* Category & Severity Selectors */}
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Category:</span>
                <select
                  value={feedbackCategoryFilter}
                  onChange={(e) => setFeedbackCategoryFilter(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-400 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="bug">Bug Reports</option>
                  <option value="content_error">NCERT Content Issues</option>
                  <option value="feature_request">Feature Requests</option>
                  <option value="general">General Feedback</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Severity:</span>
                <select
                  value={feedbackSeverityFilter}
                  onChange={(e) => setFeedbackSeverityFilter(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-400 cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <span className="text-[11px] text-slate-500 font-mono ml-auto">
                Showing {filteredFeedbacks.length} of {feedbacks.length} report(s)
              </span>
            </div>
          </div>

          {/* Feedback Items List */}
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Bug className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Feedback Reports Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || feedbackStatusFilter !== 'all' 
                  ? 'No tickets match the current filters and search criteria.' 
                  : 'Scholars have not submitted any bug reports or feedback yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedbacks.map((item) => {
                const categoryBadge: Record<string, { label: string; color: string; icon: any }> = {
                  bug: { label: 'Bug Report', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: Bug },
                  content_error: { label: 'NCERT Content', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: BookOpen },
                  feature_request: { label: 'Feature Request', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: Sparkles },
                  general: { label: 'General Feedback', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: MessageSquare }
                };

                const severityBadge: Record<string, { label: string; color: string }> = {
                  critical: { label: 'CRITICAL', color: 'bg-rose-600 text-white font-black animate-pulse' },
                  high: { label: 'HIGH', color: 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold' },
                  medium: { label: 'MEDIUM', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
                  low: { label: 'LOW', color: 'bg-slate-800 text-slate-400 border border-slate-700' }
                };

                const statusBadge: Record<string, { label: string; color: string }> = {
                  open: { label: 'OPEN', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
                  under_review: { label: 'UNDER REVIEW', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' },
                  resolved: { label: 'RESOLVED', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
                  closed: { label: 'CLOSED', color: 'bg-slate-800 text-slate-400 border-slate-700' }
                };

                const catInfo = categoryBadge[item.category] || categoryBadge.bug;
                const CatIcon = catInfo.icon;
                const sevInfo = severityBadge[item.severity] || severityBadge.medium;
                const statInfo = statusBadge[item.status] || statusBadge.open;
                const isSelected = selectedFeedbackForDetails?.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl bg-slate-900/80 border transition-all space-y-4 shadow-lg ${
                      item.status === 'open' 
                        ? 'border-slate-700 hover:border-slate-600' 
                        : item.status === 'resolved'
                        ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Top Meta Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${catInfo.color}`}>
                          <CatIcon className="w-3.5 h-3.5" />
                          <span>{catInfo.label}</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono ${sevInfo.color}`}>
                          {sevInfo.label}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${statInfo.color}`}>
                          {statInfo.label}
                        </span>

                        {(item.relatedClass || item.relatedSubject) && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-800">
                            {item.relatedClass ? `${item.relatedClass}` : ''} {item.relatedSubject ? `• ${item.relatedSubject}` : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-right text-[11px] font-mono text-slate-400">
                        <span>{item.timeIST || item.date}</span>
                        <span className="text-[9px] text-slate-400">ID: {item.id}</span>
                      </div>
                    </div>

                    {/* Scholar User Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.userPhoto ? (
                          <img
                            src={item.userPhoto}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-700">
                            {item.userDisplayName ? item.userDisplayName.charAt(0) : 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate">
                            {item.userDisplayName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {item.userEmail || item.userId}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteFeedback(item.id)}
                        disabled={actionLoading === `delete_fb_${item.id}`}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-xs text-slate-200 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>
                    </div>

                    {/* Diagnostics info if available */}
                    {item.deviceInfo && (
                      <div className="text-[10px] text-slate-400 font-mono bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/60 truncate">
                        Client System: {item.deviceInfo}
                      </div>
                    )}

                    {/* Admin Response & Action Hub */}
                    <div className="pt-2 border-t border-slate-800/60 space-y-3">
                      {/* Current Admin Notes if exist */}
                      {item.adminNotes && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Admin Resolution Note:</span>
                            </span>
                            {item.resolvedAt && (
                              <span className="text-[10px] font-mono text-slate-400">
                                Resolved: {new Date(item.resolvedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {item.adminNotes}
                          </p>
                        </div>
                      )}

                      {/* Status Update Quick Toggles */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-400 mr-1">
                            Set Status:
                          </span>

                          <button
                            onClick={() => handleUpdateFeedbackStatus(item.id, 'open')}
                            disabled={item.status === 'open' || actionLoading === `fb_status_${item.id}`}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                          >
                            Open
                          </button>

                          <button
                            onClick={() => handleUpdateFeedbackStatus(item.id, 'under_review')}
                            disabled={item.status === 'under_review' || actionLoading === `fb_status_${item.id}`}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                          >
                            Under Review
                          </button>

                          <button
                            onClick={() => {
                              const note = window.prompt('Enter resolution note for scholar (optional):', item.adminNotes || 'Fixed in syllabus database / verified.');
                              if (note !== null) {
                                handleUpdateFeedbackStatus(item.id, 'resolved', note.trim());
                              }
                            }}
                            disabled={item.status === 'resolved' || actionLoading === `fb_status_${item.id}`}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>

                          <button
                            onClick={() => handleUpdateFeedbackStatus(item.id, 'closed')}
                            disabled={item.status === 'closed' || actionLoading === `fb_status_${item.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                          >
                            Close
                          </button>
                        </div>

                        {/* Add/Edit Response Note button */}
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedFeedbackForDetails(null);
                              setAdminReplyText('');
                            } else {
                              setSelectedFeedbackForDetails(item);
                              setAdminReplyText(item.adminNotes || '');
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>{item.adminNotes ? 'Edit Response Note' : 'Add Response Note'}</span>
                        </button>
                      </div>

                      {/* Expanded Inline Admin Note Editor */}
                      {isSelected && (
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2 animate-in fade-in">
                          <label className="block text-xs font-semibold text-amber-300">
                            Administrator Resolution Response (Visible to Scholar):
                          </label>
                          <textarea
                            rows={2}
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            placeholder="e.g. Corrected the exponent formula for Question 2 in Class 10 Light chapter. Thank you for reporting!"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedFeedbackForDetails(null)}
                              className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                handleUpdateFeedbackStatus(item.id, item.status, adminReplyText.trim());
                                setSelectedFeedbackForDetails(null);
                              }}
                              className="px-3.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ===================== TAB 5: PUBLIC CHAT ===================== */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Public Study Chat Feed</h3>
              <p className="text-xs text-slate-400">{chatMessages.length} real-time peer messages in database</p>
            </div>

            <button
              onClick={handleDeleteAllChatMessages}
              disabled={actionLoading === 'delete_all_chat' || chatMessages.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Chat Messages</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60">
            {filteredChatMessages.map((msg) => (
              <div key={msg.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold shrink-0">
                    {msg.userName ? msg.userName.charAt(0) : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{msg.userName}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400">{msg.subjectTag || 'General'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 break-words">{msg.message}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteChatMessage(msg.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 5: GOD-MODE SYSTEM CONTROLS ===================== */}
      {activeTab === 'godmode' && (
        <div className="space-y-6">
          
          {/* Maintenance Killswitch Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${maintenanceConfig.isActive ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Power className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Platform Maintenance Mode</h3>
                  <p className="text-xs text-slate-400">Lock the platform with custom notice for non-admin students.</p>
                </div>
              </div>

              <button
                onClick={() => handleToggleMaintenance(!maintenanceConfig.isActive)}
                className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  maintenanceConfig.isActive
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {maintenanceConfig.isActive ? 'DEACTIVATE MAINTENANCE' : 'ACTIVATE MAINTENANCE'}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">Custom Maintenance Notice Message</label>
              <textarea
                value={customMaintenanceMsg}
                onChange={(e) => setCustomMaintenanceMsg(e.target.value)}
                placeholder="Message displayed to users when maintenance is active..."
                rows={2}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Universal Dangerous Actions Grid */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Universal Platform Reset & Purge Tools</span>
            </div>
            <p className="text-xs text-slate-400">
              High-impact administrative commands. Use with extreme caution.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleResetLeaderboards}
                className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 hover:bg-amber-500/10 text-left space-y-1 transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Reset All Leaderboards</span>
                </div>
                <p className="text-[11px] text-slate-400">Sets all scholars' scores, streaks, and quiz counts to 0.</p>
              </button>

              <button
                onClick={handleDeleteAllAttendance}
                className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 hover:bg-rose-500/10 text-left space-y-1 transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4" />
                  <span>Purge All Attendance</span>
                </div>
                <p className="text-[11px] text-slate-400">Clears all check-in logs and timestamps globally.</p>
              </button>

              <button
                onClick={handleDeleteAllChatMessages}
                className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 hover:bg-rose-500/10 text-left space-y-1 transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Purge All Public Chat</span>
                </div>
                <p className="text-[11px] text-slate-400">Wipes all peer study messages from the database.</p>
              </button>

              <button
                onClick={handleDeleteAllFeedbacks}
                className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 hover:bg-rose-500/10 text-left space-y-1 transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                  <Bug className="w-4 h-4" />
                  <span>Purge All Bug/Feedback Tickets</span>
                </div>
                <p className="text-[11px] text-slate-400">Deletes all student bug reports and feedback from the database.</p>
              </button>

              <button
                onClick={handleDeleteAllSharedQuizzes}
                className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 hover:bg-rose-500/10 text-left space-y-1 transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>Purge All Shared Quizzes</span>
                </div>
                <p className="text-[11px] text-slate-400">Deletes all community challenge links and codes.</p>
              </button>

              <button
                onClick={handleDeleteAllUsers}
                className="p-4 rounded-2xl bg-slate-950 border border-rose-500/50 hover:bg-rose-500/15 text-left space-y-1 transition-all cursor-pointer col-span-1 sm:col-span-2"
              >
                <div className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span>Purge All Scholar Accounts</span>
                </div>
                <p className="text-[11px] text-slate-400">Deletes all user accounts, quiz history, saved quizzes, and cloud records.</p>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ===================== USER INSPECTION & EDIT MODAL ===================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 pr-8">
              {selectedUser.photoURL ? (
                <img 
                  src={selectedUser.photoURL} 
                  alt={selectedUser.displayName || ''} 
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shrink-0" 
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 font-bold text-xl shrink-0">
                  {selectedUser.displayName ? selectedUser.displayName.charAt(0) : 'U'}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-xl font-bold font-display text-white truncate">
                  {selectedUser.displayName || 'Scholar Profile'}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 truncate">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedUser.email || 'No email attached'}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">UID: {selectedUser.uid}</div>
              </div>
            </div>

            {/* Editable Stats Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>God-Mode Scholar Stats Editor</span>
                </span>
                {!isEditingUserStats ? (
                  <button
                    onClick={() => setIsEditingUserStats(true)}
                    className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold"
                  >
                    Edit Values
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingUserStats(false)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveUserStats}
                      className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {isEditingUserStats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Display Name</label>
                    <input
                      type="text"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Total Score</label>
                    <input
                      type="number"
                      value={editTotalScore}
                      onChange={(e) => setEditTotalScore(Number(e.target.value))}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Quizzes Done</label>
                    <input
                      type="number"
                      value={editQuizzesCount}
                      onChange={(e) => setEditQuizzesCount(Number(e.target.value))}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">Day Streak</label>
                    <input
                      type="number"
                      value={editStreak}
                      onChange={(e) => setEditStreak(Number(e.target.value))}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div className="text-emerald-400 font-bold font-mono text-sm">{selectedUser.totalScore || 0}</div>
                    <span className="text-[10px] text-slate-500">Total Points</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div className="text-purple-400 font-bold font-mono text-sm">{selectedUser.quizzesCompleted || 0}</div>
                    <span className="text-[10px] text-slate-500">Quizzes</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div className="text-sky-400 font-bold font-mono text-sm">{selectedUser.totalQuestionsAnswered || 0}</div>
                    <span className="text-[10px] text-slate-500">Questions</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div className="text-orange-400 font-bold font-mono text-sm">🔥 {selectedUser.currentStreak || 1}d</div>
                    <span className="text-[10px] text-slate-500">Streak</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Attempt History List */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                <span>Quiz Attempts & History ({selectedUserHistory.length})</span>
                {selectedUserHistory.length > 0 && (
                  <button
                    onClick={handleDeleteAllHistoryForUser}
                    className="text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                  >
                    Delete All History
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-56">
                {isLoadingUserDetails ? (
                  <div className="p-8 text-center text-xs text-slate-500">Loading attempts...</div>
                ) : selectedUserHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No recorded quiz attempts for this scholar.</div>
                ) : (
                  selectedUserHistory.map((att) => (
                    <div key={att.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-white">{att.config.class} • {att.config.subject}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Score: <span className="text-emerald-400 font-bold">{att.score}/{att.total}</span> ({Math.round((att.score / (att.total || 1)) * 100)}%) • {att.date}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingResult(att);
                            setEditScoreVal(att.score);
                            setEditTotalVal(att.total);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          Edit Score
                        </button>
                        <button
                          onClick={() => handleDeleteUserAttempt(att.id)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Score Edit Sub-Modal */}
            {editingResult && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span>New Score:</span>
                  <input
                    type="number"
                    value={editScoreVal}
                    onChange={(e) => setEditScoreVal(Number(e.target.value))}
                    className="w-16 p-1 bg-slate-950 border border-slate-700 rounded text-center font-mono text-white"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={editTotalVal}
                    onChange={(e) => setEditTotalVal(Number(e.target.value))}
                    className="w-16 p-1 bg-slate-950 border border-slate-700 rounded text-center font-mono text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingResult(null)} className="px-3 py-1 rounded bg-slate-800 text-slate-300">Cancel</button>
                  <button onClick={handleSaveAttemptScore} className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold">Apply</button>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================== QUIZ ATTEMPT QUESTION INSPECTION MODAL ===================== */}
      {inspectingQuizRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">Quiz Question Breakdown</h3>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold">
                    {inspectingQuizRecord.subject} ({inspectingQuizRecord.class})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Score: <span className="text-emerald-400 font-bold font-mono">{inspectingQuizRecord.score}/{inspectingQuizRecord.total}</span> • Completed on {inspectingQuizRecord.date} {inspectingQuizRecord.timeIST || ''}
                </p>
              </div>

              <button
                onClick={() => setInspectingQuizRecord(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {inspectingQuizRecord.questions && inspectingQuizRecord.questions.length > 0 ? (
                inspectingQuizRecord.questions.map((q, idx) => {
                  const userAnswer = inspectingQuizRecord.userAnswers?.[idx];
                  const isCorrect = String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase() ||
                    (typeof userAnswer === 'number' && q.options[userAnswer] === q.correctAnswer);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-cyan-400 font-mono">Q{idx + 1}.</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : userAnswer !== undefined && userAnswer !== null
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCorrect ? 'Correct' : userAnswer !== undefined && userAnswer !== null ? 'Incorrect' : 'Skipped'}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-white">
                        <MathText content={q.question} />
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isOptionCorrect = opt === q.correctAnswer || String(optIdx) === String(q.correctAnswer) || String.fromCharCode(65 + optIdx).toLowerCase() === String(q.correctAnswer).toLowerCase();
                          const isOptionSelected = opt === userAnswer || String(optIdx) === String(userAnswer) || String.fromCharCode(65 + optIdx).toLowerCase() === String(userAnswer).toLowerCase();
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl text-xs border ${
                                isOptionCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                                  : isOptionSelected && !isOptionCorrect
                                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-500 uppercase">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <div>
                                  <MathText content={opt} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                          <span className="font-bold text-[10px] uppercase font-mono text-cyan-400">NCERT Solution / Rationale:</span>
                          <div>
                            <MathText content={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Question breakdown data is not stored for this older attempt.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingQuizRecord(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
