import React, { useState, useRef, useEffect } from 'react';
import { AppState, UserProfile } from '../types';
import { 
  Sparkles, 
  BookOpen, 
  History, 
  PlusCircle, 
  GraduationCap, 
  Wifi, 
  WifiOff,
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
  MessageSquare
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090d14]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate(AppState.HOME)}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-lg text-emerald-400 font-display">U</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold font-display tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                U Quiz
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md">
                AI
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 tracking-wide hidden sm:block">
              NCERT Assessment & Cloud Vault
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onNavigate(AppState.HOME)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === AppState.HOME
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Home
          </button>

          <button
            onClick={() => onNavigate(AppState.SAVED_QUIZZES)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === AppState.SAVED_QUIZZES
                ? 'bg-purple-500 text-white font-semibold shadow-md shadow-purple-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>Cloud Vault</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
              currentView === AppState.SAVED_QUIZZES 
                ? 'bg-slate-950 text-purple-300 font-bold' 
                : 'bg-slate-800 text-purple-300'
            }`}>
              {savedQuizzesCount}/50
            </span>
          </button>

          <button
            onClick={() => onNavigate(AppState.CURRICULUM)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === AppState.CURRICULUM
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Curriculum
          </button>

          <button
            onClick={() => onNavigate(AppState.LEADERBOARD)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === AppState.LEADERBOARD
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Leaderboard</span>
          </button>

          <button
            id="nav-chat-btn"
            onClick={() => onNavigate(AppState.CHAT)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === AppState.CHAT
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span>Chat Hub</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </button>

          <button
            onClick={() => onNavigate(AppState.HISTORY)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === AppState.HISTORY
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            History
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

          {/* Admin Panel Tab */}
          <button
            onClick={() => {
              if (isAdminUnlocked) {
                onNavigate(AppState.ADMIN);
              } else {
                onOpenAdminAuth();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === AppState.ADMIN
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:bg-amber-500/10'
            }`}
            title="Admin Control Portal"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Right Section / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Join Shared Quiz Code Button */}
          <button
            onClick={onOpenJoinModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Enter Quiz Code or Challenge Link"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Join Challenge</span>
          </button>

          {/* New Quiz Primary CTA */}
          <button
            onClick={() => onNavigate(AppState.SETUP)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 text-slate-950 font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>

          {/* Google Auth / User Profile Menu */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
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
                
                {/* Streak Badge */}
                {user.currentStreak && user.currentStreak > 0 ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black font-mono" title={`${user.currentStreak} day study streak`}>
                    🔥 {user.currentStreak}d
                  </span>
                ) : null}

                <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate block">
                        {user.displayName || 'Google User'}
                      </span>
                      {user.currentStreak && user.currentStreak > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-orange-500/20 text-orange-400 font-bold">
                          🔥 {user.currentStreak}d Streak
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 truncate block font-mono">
                      {user.email}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigate(AppState.SAVED_QUIZZES);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Database className="w-4 h-4 text-purple-400" />
                        <span>Cloud Vault</span>
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
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors text-left"
                    >
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Leaderboard Rankings</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigate(AppState.CHAT);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors text-left"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Study Chat & AI Tutor</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigate(AppState.HISTORY);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <Cloud className="w-4 h-4 text-emerald-400" />
                      <span>Quiz History Sync</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAdminAuth();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors text-left"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Admin Portal</span>
                    </button>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Sign In with Google to access assessments & Cloud Vault"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span className="hidden sm:inline">Google Sign In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};

