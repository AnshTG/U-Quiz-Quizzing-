import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  QuizResultRecord, 
  SavedQuizRecord, 
  SharedQuiz,
  AttendanceRecord,
  AppState 
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
  Filter
} from 'lucide-react';

interface AdminViewProps {
  onExitAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onExitAdmin }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'users' | 'shared'>('attendance');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sharedQuizzes, setSharedQuizzes] = useState<SharedQuiz[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState<string>(getISTDateString());
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  
  // Selected user for deep dive modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState<QuizResultRecord[]>([]);
  const [selectedUserSavedQuizzes, setSelectedUserSavedQuizzes] = useState<SavedQuizRecord[]>([]);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState<boolean>(false);

  // Selected quiz attempt for detail inspection
  const [inspectingQuizRecord, setInspectingQuizRecord] = useState<QuizResultRecord | null>(null);

  // Real-time synchronization for users, shared quizzes, and attendance
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

    return () => {
      unsubUsers();
      unsubShared();
      unsubAttendance();
    };
  }, []);

  // Inspect single user progress & history
  const handleInspectUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setIsLoadingUserDetails(true);
    setInspectingQuizRecord(null);

    try {
      const [history, savedQuizzes] = await Promise.all([
        fetchUserHistoryForAdmin(user.uid),
        fetchUserSavedQuizzesForAdmin(user.uid)
      ]);
      setSelectedUserHistory(history);
      setSelectedUserSavedQuizzes(savedQuizzes);
    } catch (e) {
      console.error('Failed to fetch user details:', e);
    } finally {
      setIsLoadingUserDetails(false);
    }
  };

  // Delete shared quiz as admin
  const handleDeleteSharedQuiz = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this shared public quiz challenge?')) {
      try {
        await deleteSharedQuizByAdmin(quizId);
        setSharedQuizzes(prev => prev.filter(q => q.id !== quizId));
      } catch (e) {
        alert('Failed to delete shared quiz.');
      }
    }
  };

  // System Metric Calculations
  const totalUsers = users.length;
  const totalQuizzesAttempted = users.reduce((acc, u) => acc + (u.quizzesCompleted || 0), 0);
  const totalQuestionsAnswered = users.reduce((acc, u) => acc + (u.totalQuestionsAnswered || 0), 0);
  const totalScorePoints = users.reduce((acc, u) => acc + (u.totalScore || 0), 0);
  const platformAccuracy = totalQuestionsAnswered > 0 
    ? Math.round((totalScorePoints / totalQuestionsAnswered) * 100) 
    : 0;
  const totalSavedQuizzes = users.reduce((acc, u) => acc + (u.savedQuizzesCount || 0), 0);

  // Today's attendance stats
  const todayIST = getISTDateString();
  const todayAttendanceRecords = attendanceRecords.filter(r => r.date === todayIST);
  const uniqueTodayAttendees = new Set(todayAttendanceRecords.map(r => r.userId)).size;

  // Filtered users by search
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  // Filtered attendance records
  const filteredAttendance = attendanceRecords.filter(r => {
    const matchesDate = !attendanceDateFilter || r.date === attendanceDateFilter;
    const matchesActivity = selectedActivityFilter === 'all' || r.activityType === selectedActivityFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (r.displayName && r.displayName.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.userId && r.userId.toLowerCase().includes(q)) ||
      (r.subjectAttempted && r.subjectAttempted.toLowerCase().includes(q));

    return matchesDate && matchesActivity && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Admin Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-white">
                Admin Control Dashboard
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500 text-slate-950">
                Admin Verified
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                <Radio className="w-3 h-3 text-emerald-400" /> Live Sync Active
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Live monitoring of student daily attendance logs, individual learning streaks, cloud database records, and system-wide curriculum analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">IST Time</span>
            <span className="text-xs font-mono font-bold text-amber-400">{getISTTimeString()}</span>
          </div>
          
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* Aggregate System KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Live Daily Attendance Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span>Today's Attendance</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {uniqueTodayAttendees}
          </div>
          <div className="text-[11px] text-emerald-400/90 font-mono font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {todayAttendanceRecords.length} Check-ins Today
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Students</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {totalUsers}
          </div>
          <div className="text-[11px] text-sky-400 font-medium flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Registered Accounts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Quizzes Taken</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {totalQuizzesAttempted}
          </div>
          <div className="text-[11px] text-slate-400">
            Across all grades
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Questions Solved</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {totalQuestionsAnswered}
          </div>
          <div className="text-[11px] text-slate-400">
            NCERT drill attempts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Platform Accuracy</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {platformAccuracy}%
          </div>
          <div className="text-[11px] text-amber-400/90 font-medium">
            Overall accuracy
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Vault Quizzes</span>
            <Database className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {totalSavedQuizzes}
          </div>
          <div className="text-[11px] text-lime-400 font-medium">
            50-quota cloud banks
          </div>
        </div>

      </div>

      {/* Navigation Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance & Streak Log ({attendanceRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registered Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shared')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'shared'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Shared Challenges ({sharedQuizzes.length})</span>
          </button>
        </div>

        {/* Universal Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'attendance' ? "Search student or subject..." : "Search user or email..."}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

      </div>

      {/* Main Tab Content */}
      {isLoading ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Syncing real-time database records from Firestore...</p>
        </div>
      ) : activeTab === 'attendance' ? (

        /* ====================================================
           REAL-TIME ATTENDANCE LOG FOR ADMIN
           ==================================================== */
        <div className="space-y-4">
          
          {/* Filter Bar for Attendance */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Date Filter:</span>
              </div>
              <input
                type="date"
                value={attendanceDateFilter}
                onChange={(e) => setAttendanceDateFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
              {attendanceDateFilter && (
                <button
                  onClick={() => setAttendanceDateFilter('')}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Show All Dates
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Activity:</span>
              <select
                value={selectedActivityFilter}
                onChange={(e) => setSelectedActivityFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="all">All Activities</option>
                <option value="quiz_completion">Quiz Completion</option>
                <option value="daily_login">Daily Login</option>
                <option value="manual_checkin">Manual Check-In</option>
              </select>
            </div>
          </div>

          {filteredAttendance.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-2">
              <CalendarCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No attendance entries found</p>
              <p className="text-xs text-slate-500">
                {attendanceDateFilter 
                  ? `No student check-ins recorded for ${attendanceDateFilter}. Try showing all dates.`
                  : 'Students will automatically appear here upon sign-in or quiz completion.'}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Date & Time (IST)</th>
                      <th className="py-3.5 px-4 text-center">Activity Trigger</th>
                      <th className="py-3.5 px-4 text-center">Day Streak</th>
                      <th className="py-3.5 px-4 text-center">Subject Attempted</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filteredAttendance.map((record) => {
                      const isToday = record.date === todayIST;
                      
                      return (
                        <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Student Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {record.photoURL ? (
                                <img
                                  src={record.photoURL}
                                  alt={record.displayName}
                                  className="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-500/30">
                                  {record.displayName.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate flex items-center gap-1.5">
                                  <span>{record.displayName}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {record.email || record.userId}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <div className="text-white font-semibold flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{record.date}</span>
                            </div>
                            <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <span>{record.timeStr || new Date(record.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </td>

                          {/* Activity Trigger */}
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              record.activityType === 'quiz_completion'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                : record.activityType === 'daily_login'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}>
                              {record.activityType === 'quiz_completion' ? 'Quiz Solved' : record.activityType === 'daily_login' ? 'Daily Login' : 'Check-In'}
                            </span>
                          </td>

                          {/* Streak */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-black text-xs">
                              <Flame className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{record.currentStreak || 1}d Streak</span>
                            </div>
                          </td>

                          {/* Subject Attempted */}
                          <td className="py-3 px-4 text-center font-medium">
                            {record.subjectAttempted ? (
                              <span className="text-slate-200 text-xs">
                                {record.subjectAttempted}
                                {record.scoreGained !== undefined && (
                                  <span className="ml-1 text-emerald-400 font-mono text-[11px] font-bold">
                                    (+{record.scoreGained} pts)
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isToday 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              <CheckCircle2 className="w-3 h-3" />
                              {isToday ? 'Present Today' : 'Logged'}
                            </span>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      ) : activeTab === 'users' ? (
        
        /* ====================================================
           REGISTERED USERS DIRECTORY TAB
           ==================================================== */
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No users found</p>
              <p className="text-xs text-slate-500">Try adjusting your search criteria or sign in to populate records.</p>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">User Details</th>
                      <th className="py-3.5 px-4">Daily Streak</th>
                      <th className="py-3.5 px-4">Last Active</th>
                      <th className="py-3.5 px-4 text-center">Quizzes</th>
                      <th className="py-3.5 px-4 text-center">Questions</th>
                      <th className="py-3.5 px-4 text-center">Accuracy</th>
                      <th className="py-3.5 px-4 text-center">Cloud Vault</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filteredUsers.map((u) => {
                      const questionsTotal = u.totalQuestionsAnswered || 0;
                      const accuracy = questionsTotal > 0 
                        ? Math.round(((u.totalScore || 0) / questionsTotal) * 100)
                        : 0;

                      let accuracyColor = 'text-slate-400 bg-slate-800/60 border-slate-700';
                      if (questionsTotal > 0) {
                        if (accuracy >= 80) accuracyColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                        else if (accuracy >= 50) accuracyColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                        else accuracyColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
                      }

                      return (
                        <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* User Avatar & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <img
                                  src={u.photoURL}
                                  alt={u.displayName || 'User'}
                                  className="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0 border border-amber-500/30">
                                  {(u.displayName || 'U').substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate flex items-center gap-1.5">
                                  <span>{u.displayName || 'Anonymous'}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {u.email || u.uid}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Streak Badge */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                              <Flame className="w-3 h-3 fill-amber-400" />
                              <span>{u.currentStreak || 1}d Streak</span>
                            </span>
                          </td>

                          {/* Last Active */}
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Never'}
                          </td>

                          {/* Quizzes Completed */}
                          <td className="py-3 px-4 text-center font-bold text-white font-mono">
                            {u.quizzesCompleted || 0}
                          </td>

                          {/* Questions Solved */}
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            {u.totalQuestionsAnswered || 0}
                          </td>

                          {/* Accuracy Badge */}
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border ${accuracyColor}`}>
                              {questionsTotal > 0 ? `${accuracy}%` : 'N/A'}
                            </span>
                          </td>

                          {/* Cloud Vault Stored Count */}
                          <td className="py-3 px-4 text-center font-mono text-xs">
                            <span className="text-purple-400 font-bold">
                              {u.savedQuizzesCount || 0}
                            </span>
                            <span className="text-slate-500">/50</span>
                          </td>

                          {/* Inspect Action */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleInspectUser(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Progress</span>
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      ) : (

        /* ====================================================
           SHARED PUBLIC CHALLENGES TAB
           ==================================================== */
        <div className="space-y-4">
          {sharedQuizzes.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No active shared challenges</p>
              <p className="text-xs text-slate-500">When users create public quiz challenge links, they will be listed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-lime-500/10 text-lime-400 border border-lime-500/30">
                        {quiz.config.class}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(quiz.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white font-display line-clamp-2">
                      {quiz.title}
                    </h3>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Subject:</span>
                        <span className="text-slate-200 font-semibold">{quiz.config.subject}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Questions:</span>
                        <span className="text-slate-200 font-mono">{quiz.questions.length} Items</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Plays Counter:</span>
                        <span className="text-emerald-400 font-mono font-bold">{quiz.viewsCount || 0} times</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Created by:</span>
                        <span className="text-amber-400 truncate max-w-[150px]">{quiz.creatorName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      ID: {quiz.id}
                    </div>
                    <button
                      onClick={() => handleDeleteSharedQuiz(quiz.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Progress Deep-Dive Inspector Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                {selectedUser.photoURL ? (
                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-amber-500/50 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-base border border-amber-500/40">
                    {(selectedUser.displayName || 'U').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    <span>{selectedUser.displayName || 'Anonymous Learner'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {selectedUser.currentStreak || 1}d Streak
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedUser.email || selectedUser.uid}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              
              {/* User KPI summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Total Quizzes</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {selectedUserHistory.length}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Questions Solved</span>
                  <span className="text-lg font-bold text-sky-400 font-mono">
                    {selectedUserHistory.reduce((acc, h) => acc + h.total, 0)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Total Score</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {selectedUserHistory.reduce((acc, h) => acc + h.score, 0)} pts
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Cloud Saved Quizzes</span>
                  <span className="text-lg font-bold text-purple-400 font-mono">
                    {selectedUserSavedQuizzes.length}/50
                  </span>
                </div>
              </div>

              {isLoadingUserDetails ? (
                <div className="py-12 text-center text-xs text-slate-400 font-mono">
                  Loading user quiz logs and stored vaults...
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Recent Assessment Attempts ({selectedUserHistory.length})</span>
                  </h3>

                  {selectedUserHistory.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">No completed quiz history recorded yet for this user.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedUserHistory.map((rec) => {
                        const recAccuracy = rec.total > 0 ? Math.round((rec.score / rec.total) * 100) : 0;
                        return (
                          <div 
                            key={rec.id}
                            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-200">
                                {rec.config.class} {rec.config.subject} ({rec.config.quantity} Qs)
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {new Date(rec.date).toLocaleDateString()} • {rec.config.topics.join(', ')}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-emerald-400">
                                {rec.score}/{rec.total} ({recAccuracy}%)
                              </span>
                              <button
                                onClick={() => setInspectingQuizRecord(rec)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                              >
                                View Answers
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Detailed question view for inspected record */}
                  {inspectingQuizRecord && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 mt-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Detailed Question Breakdown
                          </div>
                          <div className="text-sm font-bold text-white">
                            {inspectingQuizRecord.config.class} {inspectingQuizRecord.config.subject} ({inspectingQuizRecord.score}/{inspectingQuizRecord.total} Score)
                          </div>
                        </div>
                        <button
                          onClick={() => setInspectingQuizRecord(null)}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
                        >
                          Close Breakdown
                        </button>
                      </div>

                      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {inspectingQuizRecord.questions.map((q, idx) => {
                          const userAns = inspectingQuizRecord.userAnswers[idx];
                          const isCorrect = userAns && userAns.trim() === q.correctAnswer.trim();

                          return (
                            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-white">
                                  Q{idx + 1}. {q.question}
                                </span>
                                {isCorrect ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 shrink-0">
                                    Correct
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 shrink-0">
                                    Incorrect
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] space-y-1 text-slate-300">
                                <div>
                                  <span className="text-slate-500 font-semibold">User Answer: </span>
                                  <span className={isCorrect ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                                    {userAns || 'Skipped'}
                                  </span>
                                </div>
                                {!isCorrect && (
                                  <div>
                                    <span className="text-slate-500 font-semibold">Correct Answer: </span>
                                    <span className="text-emerald-400 font-medium">{q.correctAnswer}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
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
