import React, { useEffect, useState } from 'react';
import { SharedQuiz, QuizConfig, Question, UserProfile } from '../types';
import { fetchSharedQuiz, incrementQuizPlays } from '../services/firebase';
import { 
  Play, 
  Sparkles, 
  Users, 
  Award, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Flame,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  Trophy,
  GraduationCap
} from 'lucide-react';

interface SharedPreviewViewProps {
  quizId: string;
  user?: UserProfile | null;
  onSignIn?: () => void;
  onPlayQuiz: (config: QuizConfig, questions: Question[]) => void;
  onBackHome: () => void;
}

export const SharedPreviewView: React.FC<SharedPreviewViewProps> = ({
  quizId,
  user,
  onSignIn,
  onPlayQuiz,
  onBackHome,
}) => {
  const [quizData, setQuizData] = useState<SharedQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSharedQuiz(quizId);
        if (!data) {
          setError(`We could not find a quiz with ID "${quizId}". The challenge link might be expired, mistyped, or removed.`);
        } else {
          setQuizData(data);
        }
      } catch (err: any) {
        console.error('Fetch shared quiz error:', err);
        setError('Failed to load shared quiz. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const handleStart = () => {
    if (!quizData) return;
    incrementQuizPlays(quizId); // Non-blocking play counter increment
    onPlayQuiz(quizData.config, quizData.questions);
  };

  const handleGoogleSignInClick = () => {
    if (onSignIn) {
      setIsSigningIn(true);
      onSignIn();
      // Reset signing in state after a brief moment
      setTimeout(() => setIsSigningIn(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce shadow-xl shadow-emerald-500/10">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white">Loading Quiz Challenge...</h2>
        <p className="text-xs text-slate-400 font-mono">Retrieving academic assessment parameters from cloud vault</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">Quiz Challenge Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to U Quiz Home</span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 1: NEW / UNAUTHENTICATED USER VISITING QUIZ LINK
  // Dedicated screen saying: "To take this quiz, login"
  // =========================================================================
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6 animate-in fade-in duration-300">
        
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackHome}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
            NCERT Challenge Invite
          </span>
        </div>

        {/* Hero Card: "To take this quiz, login" */}
        <div className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-[#101923] to-slate-950 p-6 sm:p-9 shadow-2xl overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Header Badge & Title */}
          <div className="relative z-10 space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Scholar Login Required</span>
            </div>

            {/* The exact requested headline */}
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">
              To take this quiz, login
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              You’ve been invited to test your knowledge with this custom NCERT challenge. Sign in with your Google account to record your attempt, get full answer rationales, and join the leaderboard.
            </p>
          </div>

          {/* Primary Call-to-Action: High-Converting Google Sign In Button */}
          <div className="relative z-10 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-inner">
            <button
              onClick={handleGoogleSignInClick}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group disabled:opacity-70"
            >
              {isSigningIn ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google to Take This Quiz'}</span>
              {!isSigningIn && <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono text-center">
              <span>⚡ One-click sign-in</span>
              <span>•</span>
              <span>🔒 100% Free & Secure</span>
              <span>•</span>
              <span>📊 Cloud Score Tracking</span>
            </div>
          </div>

          {/* Quiz Preview Card (So user knows what they're logging in to take) */}
          <div className="relative z-10 pt-2 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Challenge Selected</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {quizData.playsCount || 0} players took this test
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                {quizData.title}
              </h3>

              {/* Creator details */}
              <div className="flex items-center gap-2.5 pt-1">
                {quizData.creatorPhoto ? (
                  <img
                    src={quizData.creatorPhoto}
                    alt={quizData.creatorName || 'Creator'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-emerald-400/40 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                    {quizData.creatorName ? quizData.creatorName.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <span className="text-xs text-slate-300">
                  Shared by <strong className="text-white">{quizData.creatorName || 'NCERT Scholar'}</strong>
                </span>
              </div>

              {/* 4 Key Quiz Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Class</span>
                  <span className="text-xs font-bold text-white mt-0.5 block truncate">{quizData.config.class}</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Subject</span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 block truncate">{quizData.config.subject}</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Difficulty</span>
                  <span className="text-xs font-bold text-amber-400 mt-0.5 block truncate">{quizData.config.strength}</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Questions</span>
                  <span className="text-xs font-bold text-cyan-400 mt-0.5 block truncate">{quizData.questions.length} MCQs</span>
                </div>
              </div>

              {/* Topics Included */}
              {quizData.config.topics && quizData.config.topics.length > 0 && (
                <div className="pt-1 space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold block">Chapters:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quizData.config.topics.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 text-xs border border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Why Login is Required (Value Propositions) */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Why login is needed for this quiz:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Save Scorecard</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Record your marks, build your streak, and save your progress to your cloud vault.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>NCERT Solutions</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Access step-by-step textbook explanations for every single question.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Award className="w-3.5 h-3.5" />
                    <span>Leaderboard Rank</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Compare your performance against fellow scholars across India.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: AUTHENTICATED USER VISITING QUIZ LINK
  // User is already logged in, shows ready preview with "Play Quiz Challenge Now"
  // =========================================================================
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Back Nav */}
      <button
        onClick={onBackHome}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </button>

      {/* Hero Shared Card */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-10 shadow-2xl overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Shared NCERT Challenge</span>
            </div>

            {/* Authenticated user pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Logged in as <strong>{user.displayName || 'Scholar'}</strong></span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white leading-tight">
            {quizData.title}
          </h1>

          {/* Creator Profile Chip */}
          <div className="flex items-center gap-3 pt-1">
            {quizData.creatorPhoto ? (
              <img
                src={quizData.creatorPhoto}
                alt={quizData.creatorName || 'Creator'}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border border-emerald-400/40 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-sm">
                {quizData.creatorName ? quizData.creatorName.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-white block">
                Created by {quizData.creatorName || 'NCERT Scholar'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {quizData.playsCount || 0} players have taken this challenge
              </span>
            </div>
          </div>
        </div>

        {/* Challenge Attributes Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-left">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Grade Level</span>
            <span className="text-xs font-bold text-white font-display truncate block mt-0.5">
              {quizData.config.class}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Subject</span>
            <span className="text-xs font-bold text-emerald-400 font-display truncate block mt-0.5">
              {quizData.config.subject}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Cognitive Demand</span>
            <span className="text-xs font-bold text-amber-400 font-mono block mt-0.5">
              {quizData.config.strength}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Total Items</span>
            <span className="text-xs font-bold text-cyan-400 font-mono block mt-0.5">
              {quizData.questions.length} Questions
            </span>
          </div>
        </div>

        {/* Topics List */}
        {quizData.config.topics && quizData.config.topics.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum Chapters Included:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quizData.config.topics.map((topic, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Play CTA Button */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Play Quiz Challenge Now</span>
          </button>
        </div>

      </div>

    </div>
  );
};
