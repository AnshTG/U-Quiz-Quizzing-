import React, { useState, useEffect, useRef } from 'react';
import { AppState, QuizConfig, Question, QuizResultRecord, SyllabusYear, UserProfile, MaintenanceConfig } from './types';
import { generateQuestions } from './services/geminiService';
import { 
  listenToAuthChanges, 
  signInWithGoogle, 
  signOutUser, 
  saveQuizResultToCloud,
  fetchUserSavedQuizzes,
  listenToMaintenanceMode,
  getISTDateString,
  getISTTimeString
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { SetupView } from './components/SetupView';
import { LoadingView } from './components/LoadingView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { CurriculumView } from './components/CurriculumView';
import { HistoryView } from './components/HistoryView';
import { LeaderboardView } from './components/LeaderboardView';
import { ChatView } from './components/ChatView';
import { SharedPreviewView } from './components/SharedPreviewView';
import { SavedQuizzesView } from './components/SavedQuizzesView';
import { AdminView } from './components/AdminView';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AttendanceModal } from './components/AttendanceModal';
import { FeedbackModal } from './components/FeedbackModal';
import { DocumentationModal } from './components/DocumentationModal';
import { LoginView } from './components/LoginView';
import { JoinQuizModal } from './components/JoinQuizModal';
import { MaintenanceView } from './components/MaintenanceView';
import { AlertCircle, X, AlertTriangle, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'uquiz_ncert_history_v1';

export default function App() {
  const [view, setView] = useState<AppState>(AppState.HOME);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [savedQuizzesCount, setSavedQuizzesCount] = useState<number>(0);
  
  // Admin authentication state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isDocumentationModalOpen, setIsDocumentationModalOpen] = useState<boolean>(false);

  // Shared challenge state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [sharedQuizId, setSharedQuizId] = useState<string | null>(null);
  
  // Active quiz config and state
  const [currentConfig, setCurrentConfig] = useState<QuizConfig>({
    class: 'Class 10',
    subject: 'Science',
    topics: ['1: Chemical Reactions and Equations', '5: Life Processes', '11: Electricity'],
    strength: 'Medium',
    quantity: 10,
    timeLimitMinutes: 0,
    syllabusYear: '2026-27'
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const generationAbortRef = useRef<AbortController | null>(null);

  // Local storage history
  const [history, setHistory] = useState<QuizResultRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Maintenance mode state
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>({ isActive: false });
  const [isMaintenanceChecking, setIsMaintenanceChecking] = useState<boolean>(true);

  // Listen to Maintenance mode
  useEffect(() => {
    // Safety timer so offline/slow connections don't hang the initial boot screen indefinitely
    const safetyTimer = setTimeout(() => {
      setIsMaintenanceChecking(false);
    }, 1200);

    const unsubscribe = listenToMaintenanceMode((config) => {
      setMaintenanceConfig(config);
      setIsMaintenanceChecking(false);
      clearTimeout(safetyTimer);
    });
    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = listenToAuthChanges(async (profile) => {
      setUser(profile);
      setIsAuthChecking(false);
      if (profile?.uid) {
        try {
          const list = await fetchUserSavedQuizzes(profile.uid);
          setSavedQuizzesCount(list.length);
        } catch (e) {
          console.warn('Could not count saved quizzes:', e);
        }
      } else {
        setSavedQuizzesCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check URL parameters for shared quiz link on load
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlQuizId = searchParams.get('quizId');
      
      let hashQuizId: string | null = null;
      if (window.location.hash.startsWith('#quiz=')) {
        hashQuizId = window.location.hash.replace('#quiz=', '');
      }

      const detectedId = urlQuizId || hashQuizId;
      if (detectedId) {
        setSharedQuizId(detectedId);
        setView(AppState.SHARED_PREVIEW);
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
  }, []);

  // Sync history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history to localStorage', e);
    }
  }, [history]);

  const navigateTo = (newView: AppState) => {
    setView(newView);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Google Sign In handler
  const handleSignIn = async () => {
    try {
      setError(null);
      const profile = await signInWithGoogle();
      if (!profile) {
        // User closed or dismissed the popup
        return;
      }
      setUser(profile);
      if (profile.uid) {
        const list = await fetchUserSavedQuizzes(profile.uid);
        setSavedQuizzesCount(list.length);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Google Sign In failed:', err);
      setError(err.message || 'Could not sign in with Google. Please try again.');
    }
  };

  // Sign Out handler
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setSavedQuizzesCount(0);
      setIsAdminUnlocked(false);
    } catch (err: any) {
      console.error('Sign Out error:', err);
    }
  };

  // Open Join Quiz Challenge from Code or Link
  const handleJoinChallenge = (quizId: string) => {
    setIsJoinModalOpen(false);
    setSharedQuizId(quizId);
    setView(AppState.SHARED_PREVIEW);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel ongoing generation
  const handleCancelGeneration = () => {
    if (generationAbortRef.current) {
      generationAbortRef.current.abort();
      generationAbortRef.current = null;
    }
    navigateTo(AppState.SETUP);
  };

  // Start generating customized quiz questions
  const handleStartQuiz = async (config: QuizConfig) => {
    setCurrentConfig(config);
    setError(null);
    navigateTo(AppState.LOADING);

    if (generationAbortRef.current) {
      generationAbortRef.current.abort();
    }
    const abortController = new AbortController();
    generationAbortRef.current = abortController;

    try {
      const generated = await generateQuestions(config, abortController.signal);
      if (!generated || generated.length === 0) {
        throw new Error('No questions generated. Please try selecting different topics or check your network.');
      }
      generationAbortRef.current = null;
      setQuestions(generated);
      setUserAnswers(new Array(generated.length).fill(null));
      setTimeSpentSeconds(0);
      setView(AppState.QUIZ);
    } catch (err: any) {
      generationAbortRef.current = null;
      if (err.name === 'AbortError' || err.message?.includes('cancelled')) {
        console.log('Quiz generation cancelled by scholar');
        setView(AppState.SETUP);
        return;
      }
      console.error('Quiz Generation Error:', err);
      setError(err.message?.includes('API key') 
        ? 'Unable to generate questions at this moment. Please try again in a few moments or select a different topic.'
        : err.message || 'Unable to generate assessment. Please check your internet connection and try again.');
      setView(AppState.SETUP);
    }
  };

  // Play pre-saved or cloud-saved quiz directly
  const handlePlaySavedQuiz = (config: QuizConfig, savedQuestions: Question[]) => {
    setCurrentConfig(config);
    setQuestions(savedQuestions);
    setUserAnswers(new Array(savedQuestions.length).fill(null));
    setTimeSpentSeconds(0);
    setView(AppState.QUIZ);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Play a Shared Quiz Challenge
  const handlePlaySharedQuiz = (config: QuizConfig, sharedQuestions: Question[]) => {
    setCurrentConfig(config);
    setQuestions(sharedQuestions);
    setUserAnswers(new Array(sharedQuestions.length).fill(null));
    setTimeSpentSeconds(0);
    setView(AppState.QUIZ);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Complete Quiz & Record Results (Local + Cloud Firestore)
  const handleSubmitQuiz = (answers: (string | null)[], elapsedSeconds: number) => {
    setUserAnswers(answers);
    setTimeSpentSeconds(elapsedSeconds);

    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] && answers[idx]?.trim() === q.correctAnswer.trim()) {
        score++;
      }
    });

    const newRecord: QuizResultRecord = {
      id: `record_${Date.now()}`,
      date: getISTDateString(),
      timestamp: Date.now(),
      timeIST: getISTTimeString(),
      config: currentConfig,
      score,
      total: questions.length,
      timeSpentSeconds: elapsedSeconds,
      questions,
      userAnswers: answers,
      sharedQuizId: sharedQuizId || undefined,
      subject: currentConfig.subject,
      class: currentConfig.class,
      topics: currentConfig.topics,
      strength: currentConfig.strength,
      userName: user?.displayName || undefined
    };

    // Save to local storage state
    setHistory(prev => [newRecord, ...prev.slice(0, 49)]); // Keep last 50

    // Save to Cloud Firestore (for both logged-in scholars and guest sessions)
    const currentUserId = user?.uid || (typeof window !== 'undefined' ? (localStorage.getItem('uquiz_client_uid') || (() => {
      const generated = 'guest_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('uquiz_client_uid', generated);
      return generated;
    })()) : 'guest_scholar');

    saveQuizResultToCloud(currentUserId, newRecord, user).catch(err => {
      console.warn('Failed to sync quiz result to Firestore:', err);
    });

    setView(AppState.RESULTS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake with same config (generates fresh questions)
  const handleRetakeSame = () => {
    handleStartQuiz(currentConfig);
  };

  // Retake only missed questions
  const handleRetakeMissed = (missedQuestions: Question[]) => {
    setQuestions(missedQuestions);
    setUserAnswers(new Array(missedQuestions.length).fill(null));
    setTimeSpentSeconds(0);
    setView(AppState.QUIZ);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Review a past quiz record from history
  const handleReviewRecord = (record: QuizResultRecord) => {
    setCurrentConfig(record.config);
    setQuestions(record.questions);
    setUserAnswers(record.userAnswers);
    setTimeSpentSeconds(record.timeSpentSeconds);
    setView(AppState.RESULTS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake a past quiz record from history
  const handleRetakeRecord = (record: QuizResultRecord) => {
    handleStartQuiz(record.config);
  };

  // Clear local history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local assessment history?')) {
      setHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // Safe fallback
      }
    }
  };

  // Curriculum setup shortcut
  const handleOpenCustomSetup = (cls?: string, sub?: string, year?: SyllabusYear) => {
    if (cls || sub || year) {
      setCurrentConfig(prev => ({
        ...prev,
        class: cls || prev.class,
        subject: sub || prev.subject,
        topics: [],
        syllabusYear: year || prev.syllabusYear || '2026-27',
      }));
    }
    navigateTo(AppState.SETUP);
  };

  // Admin PIN Success
  const handleAdminAuthSuccess = () => {
    setIsAdminUnlocked(true);
    setIsAdminAuthModalOpen(false);
    setView(AppState.ADMIN);
  };

  // If user is accessing Admin Panel
  const isViewingAdmin = view === AppState.ADMIN;

  // Immediate Zero-Flicker Initial Boot Loader:
  // Prevents any premature flash of Home or Login screens before maintenance/auth status is confirmed
  if (isMaintenanceChecking) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col items-center justify-center space-y-4 px-4 font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 p-0.5 shadow-2xl shadow-emerald-500/20 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span className="font-extrabold text-2xl text-emerald-400 font-display">U</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-white tracking-wide">U-Quiz NCERT</h3>
          <p className="text-xs text-slate-400 font-mono">Initializing academic assessment environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={view === AppState.CHAT ? "h-screen h-[100dvh] bg-[#0b141a] text-slate-100 flex flex-col overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-400" : "min-h-screen bg-[#090d14] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400"}>
      
      {/* Top Banner when Maintenance Mode is active and Admin is in bypass mode */}
      {maintenanceConfig.isActive && isAdminUnlocked && (
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 px-3 sm:px-4 py-2 text-white text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-lg sticky top-0 z-50 w-full overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AlertTriangle className="w-4 h-4 text-white animate-pulse shrink-0" />
            <span className="break-words leading-tight">MAINTENANCE ACTIVE &bull; Public access blocked (Admin Bypass Mode)</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {view !== AppState.ADMIN && (
              <button
                onClick={() => setView(AppState.ADMIN)}
                className="px-2.5 py-1 rounded-md bg-black/40 hover:bg-black/60 text-white text-[11px] font-mono transition-colors cursor-pointer border border-white/20 flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3 text-amber-300" />
                <span>Admin Dashboard</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsAdminUnlocked(false);
                setView(AppState.HOME);
              }}
              className="px-2.5 py-1 rounded-md bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-[11px] font-mono transition-colors cursor-pointer border border-rose-400/30"
            >
              Lock & Exit Bypass
            </button>
          </div>
        </div>
      )}

      {/* If Maintenance mode is active and user is NOT an unlocked admin, show Maintenance screen */}
      {maintenanceConfig.isActive && !isAdminUnlocked ? (
        <MaintenanceView
          config={maintenanceConfig}
          onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        />
      ) : (
        <>
          {/* Top Navigation Bar - Universally available across all views */}
          <Navbar
            currentView={view}
            onNavigate={(targetView) => {
              navigateTo(targetView);
            }}
            isOnline={isOnline}
            historyCount={history.length}
            savedQuizzesCount={savedQuizzesCount}
            user={user}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onOpenJoinModal={() => setIsJoinModalOpen(true)}
            onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
            onOpenAttendance={() => setIsAttendanceModalOpen(true)}
            onOpenFeedback={() => setIsFeedbackModalOpen(true)}
            onOpenDocs={() => setIsDocumentationModalOpen(true)}
            isAdminUnlocked={isAdminUnlocked}
            isLoginScreen={!user && !isAdminUnlocked}
          />

          {/* Dismissable Global Error Toast */}
          {error && (
            <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 w-full">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start sm:items-center justify-between gap-3 shadow-lg w-full overflow-hidden">
                <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-xs sm:text-sm font-medium break-words leading-snug">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer shrink-0"
                  aria-label="Dismiss error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Main View Router */}
          <main className={view === AppState.CHAT ? "flex-1 min-h-0 flex flex-col overflow-hidden" : "flex-1 pb-28 md:pb-12"}>
            
            {/* Admin View is accessible ONLY when unlocked via fresh PIN */}
            {isViewingAdmin ? (
              <AdminView 
                onExitAdmin={() => {
                  setIsAdminUnlocked(false);
                  setView(AppState.HOME);
                }} 
                onEnterMainWebsite={() => {
                  navigateTo(AppState.HOME);
                }}
                onOpenDocs={() => setIsDocumentationModalOpen(true)}
              />
            ) : isAuthChecking ? (
              <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 p-0.5 shadow-xl shadow-emerald-500/20 animate-pulse">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <span className="font-extrabold text-xl text-emerald-400 font-display">U</span>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold text-white tracking-wide">Authenticating Scholar Account</h3>
                  <p className="text-xs text-slate-400 font-mono">Securing NCERT assessment environment...</p>
                </div>
              </div>
            ) : !user && !isAdminUnlocked ? (
              /* Mandatory Google Sign-in Gate - Strict & Unbypassable for non-admins */
              <LoginView
                onSignIn={handleSignIn}
                onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
                error={error}
              />
            ) : (
              <>
                {view === AppState.HOME && (
                  <HomeView
                    onStartQuizConfig={handleStartQuiz}
                    onNavigate={navigateTo}
                    recentHistory={history}
                  />
                )}

                {view === AppState.SETUP && (
                  <SetupView
                    initialConfig={currentConfig}
                    onGenerateQuiz={handleStartQuiz}
                    onCancel={() => navigateTo(AppState.HOME)}
                  />
                )}

                {view === AppState.SAVED_QUIZZES && (
                  <SavedQuizzesView
                    user={user}
                    onPlayQuiz={handlePlaySavedQuiz}
                    onNewQuiz={() => navigateTo(AppState.SETUP)}
                    onBackHome={() => navigateTo(AppState.HOME)}
                  />
                )}

                {view === AppState.LOADING && (
                  <LoadingView
                    config={currentConfig}
                    onCancel={handleCancelGeneration}
                  />
                )}

                {view === AppState.QUIZ && questions.length > 0 && (
                  <QuizView
                    config={currentConfig}
                    questions={questions}
                    onSubmitQuiz={handleSubmitQuiz}
                    onQuitQuiz={() => navigateTo(AppState.HOME)}
                  />
                )}

                {view === AppState.RESULTS && questions.length > 0 && (
                  <ResultsView
                    config={currentConfig}
                    questions={questions}
                    userAnswers={userAnswers}
                    timeSpentSeconds={timeSpentSeconds}
                    user={user}
                    history={history}
                    onRetakeSame={handleRetakeSame}
                    onRetakeMissed={handleRetakeMissed}
                    onNewQuiz={() => navigateTo(AppState.SETUP)}
                    onNavigateCurriculum={() => navigateTo(AppState.CURRICULUM)}
                    onNavigateLeaderboard={() => navigateTo(AppState.LEADERBOARD)}
                    onSignIn={handleSignIn}
                    onBackHome={() => navigateTo(AppState.HOME)}
                  />
                )}

                {view === AppState.CURRICULUM && (
                  <CurriculumView
                    onStartChapterQuiz={handleStartQuiz}
                    onOpenCustomSetup={handleOpenCustomSetup}
                    onBackHome={() => navigateTo(AppState.HOME)}
                  />
                )}

                {view === AppState.HISTORY && (
                  <HistoryView
                    history={history}
                    user={user}
                    onReviewRecord={handleReviewRecord}
                    onRetakeRecord={handleRetakeRecord}
                    onClearHistory={handleClearHistory}
                    onNewQuiz={() => navigateTo(AppState.SETUP)}
                    onSignIn={handleSignIn}
                    onBackHome={() => navigateTo(AppState.HOME)}
                  />
                )}

                {view === AppState.LEADERBOARD && (
                  <LeaderboardView
                    user={user}
                    onNavigate={navigateTo}
                    onStartQuiz={() => navigateTo(AppState.SETUP)}
                    onSignIn={handleSignIn}
                  />
                )}

                {view === AppState.CHAT && (
                  <ChatView
                    user={user}
                    onSignIn={handleSignIn}
                    onBackHome={() => navigateTo(AppState.HOME)}
                  />
                )}

                {view === AppState.SHARED_PREVIEW && sharedQuizId && (
                  <SharedPreviewView
                    quizId={sharedQuizId}
                    onPlayQuiz={handlePlaySharedQuiz}
                    onBackHome={() => navigateTo(AppState.HOME)}
                  />
                )}
              </>
            )}

          </main>

          {/* Global Footer - Rendered strictly on the Home screen per user preference */}
          {view === AppState.HOME && (
            <Footer onNavigate={navigateTo} />
          )}
        </>
      )}

      {/* Join Quiz Challenge Modal */}
      {isJoinModalOpen && (
        <JoinQuizModal
          onJoinQuiz={handleJoinChallenge}
          onClose={() => setIsJoinModalOpen(false)}
        />
      )}

      {/* Admin Authentication Modal */}
      {isAdminAuthModalOpen && (
        <AdminAuthModal
          onSuccess={handleAdminAuthSuccess}
          onClose={() => setIsAdminAuthModalOpen(false)}
        />
      )}

      {/* User Attendance & Streak Modal */}
      {isAttendanceModalOpen && (
        <AttendanceModal
          user={user}
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          onSignIn={handleSignIn}
        />
      )}

      {/* User Bug Report & Feedback Modal */}
      {isFeedbackModalOpen && (
        <FeedbackModal
          user={user}
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSignIn={handleSignIn}
        />
      )}

      {/* Platform Manual & Documentation Modal */}
      {isDocumentationModalOpen && (
        <DocumentationModal
          isOpen={isDocumentationModalOpen}
          onClose={() => setIsDocumentationModalOpen(false)}
          isAdmin={isAdminUnlocked}
        />
      )}

    </div>
  );
}

