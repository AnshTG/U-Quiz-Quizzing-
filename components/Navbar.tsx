import React, { useState, useRef, useEffect } from 'react';
import { AppState, UserProfile } from '../types';
import { 
  Sparkles, 
  BookOpen, 
  History, 
  PlusCircle, 
  GraduationCap, 
  LogIn, 
  LogOut, 
  User, 
  QrCode, 
  CheckCircle2, 
  ChevronDown, 
  Cloud, 
  Database, 
  Lock, 
  ShieldCheck, 
  Trophy, 
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  Home,
  Flame,
  Bug,
  HelpCircle
} from 'lucide-react';

interface NavbarProps {
  currentView: AppState;
  onNavigate: (view: AppState) => void;
  isOnline: boolean;
  historyCount?: number;
  savedQuizzesCount?: number;
  user: UserProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenJoinModal: () => void;
  onOpenAdminAuth: () => void;
  onOpenAttendance: () => void;
  onOpenFeedback: () => void;
  isAdminUnlocked?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isOnline,
  historyCount = 0,
  savedQuizzesCount = 0,
  user,
  onSignIn,
  onSignOut,
  onOpenJoinModal,
  onOpenAdminAuth,
  onOpenAttendance,
  onOpenFeedback,
  isAdminUnlocked = false
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewTitle = (view: AppState): { label: string; icon: any } => {
    switch (view) {
      case AppState.SETUP:
        return { label: 'Custom Quiz Configurator', icon: PlusCircle };
      case AppState.CURRICULUM:
        return { label: 'NCERT Curriculum Directory', icon: BookOpen };
      case AppState.LEADERBOARD:
        return { label: 'Scholar Leaderboard', icon: Trophy };
      case AppState.SAVED_QUIZZES:
        return { label: 'Cloud Quiz Vault', icon: Database };
      case AppState.CHAT:
        return { label: 'Study Chat & AI Tutor', icon: MessageSquare };
      case AppState.HISTORY:
        return { label: 'Assessment History', icon: History };
      case AppState.QUIZ:
        return { label: 'Active Assessment', icon: Sparkles };
      case AppState.RESULTS:
        return { label: 'Scorecard & Review', icon: Trophy };
      case AppState.SHARED_PREVIEW:
        return { label: 'Shared Challenge', icon: QrCode };
      case AppState.ADMIN:
        return { label: 'Admin Portal', icon: Lock };
      default:
        return { label: 'Home Dashboard', icon: Home };
    }
  };

  const currentViewMeta = getViewTitle(currentView);
  const showBreadcrumbBar = currentView !== AppState.HOME && currentView !== AppState.QUIZ && currentView !== AppState.CHAT && currentView !== AppState.LOADING;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090d14]/95 backdrop-blur-md transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Left: Brand Logo & Back Shortcut */}
          <div className="flex items-center gap-3 shrink-0">
            {showBreadcrumbBar && (
              <button
                onClick={() => onNavigate(AppState.HOME)}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Back to Home Dashboard"
                aria-label="Back to Home Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div 
              onClick={() => onNavigate(AppState.HOME)}
              className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-extrabold text-base text-emerald-400 font-display">U</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold font-display tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    U Quiz
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                    NCERT
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 tracking-wide hidden lg:block">
                  AI Assessment & Doubts
                </span>
              </div>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => onNavigate(AppState.HOME)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === AppState.HOME
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onNavigate(AppState.CURRICULUM)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === AppState.CURRICULUM
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum</span>
            </button>

            <button
              onClick={() => onNavigate(AppState.SAVED_QUIZZES)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === AppState.SAVED_QUIZZES
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Vault</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                currentView === AppState.SAVED_QUIZZES 
                  ? 'bg-slate-950 text-purple-300 font-bold' 
                  : 'bg-slate-800 text-purple-300'
              }`}>
                {savedQuizzesCount}
              </span>
            </button>

            <button
              onClick={() => onNavigate(AppState.LEADERBOARD)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === AppState.LEADERBOARD
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            <button
              id="nav-chat-btn"
              onClick={() => onNavigate(AppState.CHAT)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === AppState.CHAT
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
              <span>Study Chat</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            </button>

            <button
              onClick={() => onNavigate(AppState.HISTORY)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === AppState.HISTORY
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {historyCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  currentView === AppState.HISTORY 
                    ? 'bg-slate-950 text-emerald-400 font-bold' 
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Section: Actions & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Feedback / Bug Report Quick Trigger */}
            <button
              onClick={onOpenFeedback}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
              title="Report Bug or Send Feedback"
            >
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden lg:inline">Report</span>
            </button>

            {/* Join Shared Challenge Code Button */}
            <button
              onClick={onOpenJoinModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Enter Quiz Code or Challenge Link"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Join Code</span>
            </button>

            {/* Create Quiz Primary CTA */}
            <button
              onClick={() => onNavigate(AppState.SETUP)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">New Quiz</span>
            </button>

            {/* Google Auth / Profile Dropdown */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                  aria-label="User Profile Menu"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-emerald-400/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xs">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  
                  {user.currentStreak && user.currentStreak > 0 ? (
                    <span className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black font-mono">
                      🔥 {user.currentStreak}d
                    </span>
                  ) : null}

                  <span className="text-xs font-semibold text-slate-200 hidden xl:inline max-w-[90px] truncate">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900 p-2.5 shadow-2xl space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate block">
                          {user.displayName || 'Google User'}
                        </span>
                        {user.currentStreak && user.currentStreak > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-orange-500/20 text-orange-400 font-bold">
                            🔥 {user.currentStreak}d
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block font-mono">
                        {user.email}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenAttendance();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-orange-400" />
                          <span>My Attendance & Streak</span>
                        </div>
                        <span className="text-[10px] font-mono text-orange-400 font-bold">
                          🔥 {user.currentStreak || 1}d
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onNavigate(AppState.SAVED_QUIZZES);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-purple-400" />
                          <span>Cloud Quiz Vault</span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 font-bold">
                          {savedQuizzesCount}/50
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onNavigate(AppState.LEADERBOARD);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors text-left cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Leaderboard Rankings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onNavigate(AppState.CHAT);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors text-left cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                        <span>Study Chat & AI Tutor</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onNavigate(AppState.HISTORY);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Quiz History & Analytics</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenFeedback();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                      >
                        <Bug className="w-3.5 h-3.5 text-rose-400" />
                        <span>Report Bug & Feedback</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenAdminAuth();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors text-left cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Admin Portal</span>
                      </button>

                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onSignOut();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Sign In with Google"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

          </div>
        </div>

        {/* Universal Breadcrumb Bar on Sub-Views */}
        {showBreadcrumbBar && (
          <div className="border-t border-slate-800/60 bg-slate-950/80 px-3 sm:px-6 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 truncate">
                <button
                  onClick={() => onNavigate(AppState.HOME)}
                  className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Dashboard</span>
                </button>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                <div className="flex items-center gap-1.5 text-slate-200 font-bold truncate">
                  <currentViewMeta.icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{currentViewMeta.label}</span>
                </div>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
                <button 
                  onClick={() => onNavigate(AppState.CURRICULUM)} 
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Curriculum
                </button>
                <span>•</span>
                <button 
                  onClick={() => onNavigate(AppState.SAVED_QUIZZES)} 
                  className="hover:text-purple-400 transition-colors cursor-pointer"
                >
                  Vault ({savedQuizzesCount})
                </button>
                <span>•</span>
                <button 
                  onClick={() => onNavigate(AppState.LEADERBOARD)} 
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Leaderboard
                </button>
                <span>•</span>
                <button 
                  onClick={() => onNavigate(AppState.CHAT)} 
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  AI Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Responsive Mobile Bottom Navigation Bar */}
      {currentView !== AppState.CHAT && currentView !== AppState.QUIZ && currentView !== AppState.ADMIN && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
          <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
            <button
              onClick={() => onNavigate(AppState.HOME)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                currentView === AppState.HOME
                  ? 'text-emerald-400 font-bold bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>

            <button
              onClick={() => onNavigate(AppState.CURRICULUM)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                currentView === AppState.CURRICULUM
                  ? 'text-emerald-400 font-bold bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Syllabus</span>
            </button>

            <button
              onClick={() => onNavigate(AppState.SETUP)}
              className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-950 font-bold bg-gradient-to-r from-emerald-500 to-lime-500 shadow-md shadow-emerald-500/30 cursor-pointer -mt-3"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-wider">Quiz</span>
            </button>

            <button
              onClick={() => onNavigate(AppState.LEADERBOARD)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                currentView === AppState.LEADERBOARD
                  ? 'text-amber-400 font-bold bg-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Ranks</span>
            </button>

            <button
              onClick={() => onNavigate(AppState.CHAT)}
              className="flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-200"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">Chats</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
