import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QuizConfig, Question, AppState, UserProfile, SavedQuizRecord, QuizResultRecord } from '../types';
import { MathText } from './MathText';
import { ScorecardExportModal } from './ScorecardExportModal';
import { ShareQuizModal } from './ShareQuizModal';
import { SaveQuizModal } from './SaveQuizModal';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Printer, 
  Share2, 
  Filter,
  Flame,
  Image,
  Globe,
  CloudCheck,
  Cloud,
  Database,
  Bookmark
} from 'lucide-react';

interface ResultsViewProps {
  config: QuizConfig;
  questions: Question[];
  userAnswers: (string | null)[];
  timeSpentSeconds: number;
  user: UserProfile | null;
  history?: QuizResultRecord[];
  onRetakeSame: () => void;
  onRetakeMissed: (missedQuestions: Question[]) => void;
  onNewQuiz: () => void;
  onNavigateCurriculum: () => void;
  onNavigateLeaderboard?: () => void;
  onSignIn?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  config,
  questions,
  userAnswers,
  timeSpentSeconds,
  user,
  history,
  onRetakeSame,
  onRetakeMissed,
  onNewQuiz,
  onNavigateCurriculum,
  onNavigateLeaderboard,
  onSignIn,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [copied, setCopied] = useState(false);
  const [isExportImageModalOpen, setIsExportImageModalOpen] = useState(false);
  const [isShareQuizModalOpen, setIsShareQuizModalOpen] = useState(false);
  const [isSaveQuizModalOpen, setIsSaveQuizModalOpen] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Compute results
  let correctCount = 0;
  const missedQuestionsList: Question[] = [];

  questions.forEach((q, idx) => {
    const userAns = userAnswers[idx];
    const isCorrect = userAns && userAns.trim() === q.correctAnswer.trim();
    if (isCorrect) {
      correctCount++;
    } else {
      missedQuestionsList.push(q);
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  const avgTimePerQ = Math.round(timeSpentSeconds / questions.length);

  // Trigger celebration confetti on great scores
  useEffect(() => {
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#34d399', '#a3e635', '#38bdf8', '#fbbf24']
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [percentage]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  const getScoreAssessment = () => {
    if (percentage >= 90) return { title: 'Exceptional Mastery!', desc: 'Outstanding precision and deep conceptual grasp of the NCERT standard.', color: 'text-emerald-400', badge: 'Tier 1 • Master' };
    if (percentage >= 75) return { title: 'Great Performance!', desc: 'Strong understanding with minor review needed on nuanced points.', color: 'text-lime-400', badge: 'Tier 2 • Proficient' };
    if (percentage >= 50) return { title: 'Solid Foundation', desc: 'Good baseline recall, practice recommended on multi-step concepts.', color: 'text-amber-400', badge: 'Tier 3 • Developing' };
    return { title: 'Conceptual Review Needed', desc: 'Review the chapter summaries and rationales below to reinforce fundamentals.', color: 'text-rose-400', badge: 'Needs Reinforcement' };
  };

  const assessment = getScoreAssessment();

  const handleQuickCopyScore = () => {
    const shareText = `I scored ${correctCount}/${questions.length} (${percentage}%) in ${config.class} ${config.subject} on U Quiz AI! 🚀`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredQuestions = questions.map((q, idx) => ({ q, idx })).filter(({ q, idx }) => {
    const isCorrect = userAnswers[idx] && userAnswers[idx]?.trim() === q.correctAnswer.trim();
    if (filterMode === 'correct') return isCorrect;
    if (filterMode === 'incorrect') return !isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Cloud Sync Status Indicator */}
      {user ? (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Saved to Cloud for {user.displayName || user.email}</span>
          </div>
          <span className="text-[10px] text-emerald-300/80 uppercase tracking-wider">Firestore Synchronized</span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-slate-400" />
            <span>Result saved locally. Sign in with Google to sync across all your devices.</span>
          </div>
          {onSignIn && (
            <button
              onClick={onSignIn}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Save to Cloud Vault Success Alert */}
      {savedSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/40 text-purple-300 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{savedSuccessMessage}</span>
          </div>
          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Stored in Vault</span>
        </div>
      )}

      {/* Hero Scorecard Banner */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-10 shadow-2xl overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>{assessment.badge}</span>
          </div>

          <h1 className={`text-3xl sm:text-4xl font-extrabold font-display ${assessment.color}`}>
            {assessment.title}
          </h1>

          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            {assessment.desc}
          </p>

          {/* Big Score Display */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-black font-display text-white tracking-tight">
                {correctCount}<span className="text-2xl text-slate-500 font-normal">/{questions.length}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono mt-1 block">Score Achieved</span>
            </div>

            <div className="w-px h-16 bg-slate-800" />

            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-black font-display text-emerald-400 tracking-tight">
                {percentage}%
              </div>
              <span className="text-xs text-slate-400 font-mono mt-1 block">Accuracy</span>
            </div>
          </div>
        </div>

        {/* Quick Meta Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 text-left">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Grade & Subject</span>
            <span className="text-xs font-bold text-white font-display truncate block mt-0.5">
              {config.class} • {config.subject}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Cognitive Demand</span>
            <span className="text-xs font-bold text-amber-400 font-mono block mt-0.5">
              {config.strength}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Total Time</span>
            <span className="text-xs font-bold text-cyan-400 font-mono block mt-0.5">
              {formatTime(timeSpentSeconds)}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Pacing Speed</span>
            <span className="text-xs font-bold text-slate-300 font-mono block mt-0.5">
              ~{avgTimePerQ}s / question
            </span>
          </div>
        </div>

        {/* Main High-Impact Social & Cloud Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          
          {/* Share Score in Image Format directly through device */}
          <button
            onClick={() => setIsExportImageModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Image className="w-4 h-4" />
            <span>Share Result in Image Format</span>
          </button>

          {/* Store Quiz to Cloud Vault (50 limit) */}
          <button
            onClick={() => setIsSaveQuizModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Store Quiz to Cloud Vault (Max 50)</span>
          </button>

          {/* Share Quiz Challenge Link for friends to play */}
          <button
            onClick={() => setIsShareQuizModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Share Quiz Link</span>
          </button>

          {/* View Leaderboard Ranking */}
          {onNavigateLeaderboard && (
            <button
              onClick={onNavigateLeaderboard}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard Standings</span>
            </button>
          )}
        </div>

        {/* Secondary Quiz Workflow Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 border-t border-slate-800/60">
          <button
            onClick={onRetakeSame}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Retake Same Quiz</span>
          </button>

          {missedQuestionsList.length > 0 && (
            <button
              onClick={() => onRetakeMissed(missedQuestionsList)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry {missedQuestionsList.length} Missed</span>
            </button>
          )}

          <button
            onClick={onNewQuiz}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Custom Quiz</span>
          </button>

          <button
            onClick={handleQuickCopyScore}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied Text!' : 'Copy Score Text'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Recharts Performance Trend Visualization (Last 10 Sessions) */}
      <PerformanceTrendChart
        currentSession={{
          percentage,
          score: correctCount,
          total: questions.length,
          subject: config.subject,
          grade: config.class,
          timestamp: Date.now(),
          timeSpentSeconds
        }}
        user={user}
      />

      {/* Question Analysis & Rationales Section */}
      <div className="space-y-6">
        
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">
              Item-by-Item NCERT Analysis
            </h2>
            <p className="text-xs text-slate-400">
              Detailed step-by-step conceptual rationale for each question
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterMode === 'incorrect'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Missed ({questions.length - correctCount})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterMode === 'correct'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Correct ({correctCount})
            </button>
          </div>
        </div>

        {/* Question Review Cards List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-500 text-sm">
              No questions in this filter view.
            </div>
          ) : (
            filteredQuestions.map(({ q, idx }) => {
              const userAns = userAnswers[idx];
              const isCorrect = userAns && userAns.trim() === q.correctAnswer.trim();
              const isSkipped = userAns === null;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-6 space-y-4 transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/10 border-emerald-900/40'
                      : isSkipped
                      ? 'bg-slate-900/40 border-slate-800'
                      : 'bg-rose-950/10 border-rose-900/40'
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        Q{idx + 1}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                        isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : isSkipped
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </>
                        ) : isSkipped ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Skipped</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="text-base font-semibold text-white leading-relaxed">
                    <MathText content={q.question} />
                  </div>

                  {/* Options Evaluation Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAns === opt;
                      const isTheCorrectOption = opt.trim() === q.correctAnswer.trim();

                      return (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                            isTheCorrectOption
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-semibold'
                              : isSelected
                              ? 'bg-rose-500/15 border-rose-500/50 text-rose-200 line-through'
                              : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                          }`}
                        >
                          <div className="flex-1">
                            <MathText content={opt} />
                          </div>
                          {isTheCorrectOption && (
                            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 shrink-0">
                              Correct Key
                            </span>
                          )}
                          {isSelected && !isTheCorrectOption && (
                            <span className="text-[10px] uppercase font-mono font-bold text-rose-400 shrink-0">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* NCERT Concept Rationale Box */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>NCERT Concept Rationale:</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      <MathText content={q.explanation} />
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Export Scorecard Image Modal */}
      {isExportImageModalOpen && (
        <ScorecardExportModal
          config={config}
          questions={questions}
          userAnswers={userAnswers}
          timeSpentSeconds={timeSpentSeconds}
          user={user}
          onClose={() => setIsExportImageModalOpen(false)}
        />
      )}

      {/* Share Quiz Challenge Modal */}
      {isShareQuizModalOpen && (
        <ShareQuizModal
          config={config}
          questions={questions}
          user={user}
          onClose={() => setIsShareQuizModalOpen(false)}
        />
      )}

      {/* Save to Cloud Vault Modal */}
      {isSaveQuizModalOpen && (
        <SaveQuizModal
          config={config}
          questions={questions}
          user={user}
          onClose={() => setIsSaveQuizModalOpen(false)}
          onSaved={(savedRecord) => {
            setIsSaveQuizModalOpen(false);
            setSavedSuccessMessage(`Successfully stored "${savedRecord.title}" in your Cloud Vault!`);
            setTimeout(() => setSavedSuccessMessage(null), 4000);
          }}
          onSignIn={() => {
            setIsSaveQuizModalOpen(false);
            if (onSignIn) onSignIn();
          }}
        />
      )}

    </div>
  );
};
