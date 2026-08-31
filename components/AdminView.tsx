import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserProfile, 
  QuizResultRecord, 
  SavedQuizRecord, 
  SharedQuiz,
  AttendanceRecord,
  AppState,
  MaintenanceConfig,
  ChatMessage
} from '../types';
import { 
  fetchAllUsersForAdmin, 
  fetchUserHistoryForAdmin, 
  fetchUserSavedQuizzesForAdmin,
  fetchAllSharedQuizzesForAdmin,
  deleteSharedQuizByAdmin,
  subscribeToAllUsersForAdmin,
  subscribeToSharedQuizzesForAdmin,
  subscribeToAttendance,
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
  listenToPublicChat,
  deletePublicChatMessage,
  listenToMaintenanceMode,
  updateMaintenanceMode,
  getISTDateString,
  getISTTimeString
} from '../services/firebase';
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
  Plus
} from 'lucide-react';

interface AdminViewProps {
  onExitAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onExitAdmin }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'scholars' | 'shared' | 'chat' | 'godmode'>('attendance');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sharedQuizzes, setSharedQuizzes] = useState<SharedQuiz[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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

  // Real-time subscriptions
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
      setAttendanceRecords(records);
    });

    const unsubChat = listenToPublicChat((msgs) => {
      setChatMessages(msgs);
    });

    const unsubMaintenance = listenToMaintenanceMode((config) => {
      setMaintenanceConfig(config);
      if (config.message && !customMaintenanceMsg) setCustomMaintenanceMsg(config.message);
      if (config.estimatedDuration && !estimatedDuration) setEstimatedDuration(config.estimatedDuration);
    });

    return () => {
      unsubUsers();
      unsubShared();
      unsubAttendance();
      unsubChat();
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
    try {
      await deleteSharedQuizByAdmin(quizId);
      showToast(`Shared quiz #${quizId} deleted.`);
    } catch (err) {
      alert('Failed to delete shared quiz.');
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
      showToast(`Purged ${count} shared challenge quizzes.`);
    } catch (err) {
      alert('Failed to delete all shared quizzes.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Individual Chat Message
  const handleDeleteChatMessage = async (msgId: string) => {
    if (!window.confirm('Delete this chat message?')) return;
    try {
      await deletePublicChatMessage(msgId);
      showToast('Chat message deleted.');
    } catch (e) {
      alert('Failed to delete message.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 lg:p-8 space-y-6">
      
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
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
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
                      <th className="px-4 py-3">Google Email Address</th>
                      <th className="px-4 py-3">UID</th>
                      <th className="px-4 py-3">Score & Quizzes</th>
                      <th className="px-4 py-3">Streak</th>
                      <th className="px-4 py-3">Last Active</th>
                      <th className="px-4 py-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {u.photoURL ? (
                              <img 
                                src={u.photoURL} 
                                alt={u.displayName || ''} 
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover border border-emerald-400/30 shrink-0" 
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                {u.displayName ? u.displayName.charAt(0) : 'U'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{u.displayName || 'Google Scholar'}</div>
                              <span className="text-[10px] text-slate-500 font-mono">Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-mono text-emerald-400">
                          {u.email || 'No email attached'}
                        </td>

                        <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">
                          {u.uid.substring(0, 10)}...
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

                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleInspectUser(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Inspect & Edit
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

      {/* ===================== TAB 4: PUBLIC CHAT ===================== */}
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

    </div>
  );
};
