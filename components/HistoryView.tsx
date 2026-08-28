import React, { useState, useEffect } from 'react';
import { QuizResultRecord, AppState, UserProfile } from '../types';
import { fetchUserQuizHistory, deleteUserQuizResult } from '../services/firebase';
import { 
  History, 
  Trash2, 
  RotateCcw, 
  Eye, 
  Award, 
  Clock, 
  BookOpen, 
  ArrowRight,
  PlusCircle,
  Cloud,
  HardDrive,
  Loader2,
  CheckCircle2,
  LogIn
} from 'lucide-react';

interface HistoryViewProps {
  history: QuizResultRecord[];
  user: UserProfile | null;
  onReviewRecord: (record: QuizResultRecord) => void;
  onRetakeRecord: (record: QuizResultRecord) => void;
  onClearHistory: () => void;
  onNewQuiz: () => void;
  onSignIn: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  user,
  onReviewRecord,
  onRetakeRecord,
  onClearHistory,
  onNewQuiz,
  onSignIn,
}) => {
  const [tab, setTab] = useState<'all' | 'cloud' | 'local'>('all');
  const [cloudHistory, setCloudHistory] = useState<QuizResultRecord[]>([]);
  const [loadingCloud, setLoadingCloud] = useState<boolean>(false);

  // Fetch Cloud History from Firestore when user is logged in
  useEffect(() => {
    if (user?.uid) {
      const loadCloud = async () => {
        try {
          setLoadingCloud(true);
          const data = await fetchUserQuizHistory(user.uid);
          setCloudHistory(data);
        } catch (e) {
          console.error('Failed to load cloud history:', e);
        } finally {
          setLoadingCloud(false);
        }
      };
      loadCloud();
    } else {
      setCloudHistory([]);
    }
  }, [user]);

  // Combine and deduplicate records
  const displayRecords = React.useMemo(() => {
    if (tab === 'local') return history;
    if (tab === 'cloud') return cloudHistory;

    // Merge both
    const map = new Map<string, QuizResultRecord>();
    cloudHistory.forEach(item => map.set(item.id, item));
    history.forEach(item => {
      if (!map.has(item.id)) map.set(item.id, item);
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [tab, history, cloudHistory]);

  const totalQuizzes = displayRecords.length;
  const totalScore = displayRecords.reduce((acc, curr) => acc + curr.score, 0);
  const totalItems = displayRecords.reduce((acc, curr) => acc + curr.total, 0);
  const avgAccuracy = totalItems > 0 ? Math.round((totalScore / totalItems) * 100) : 0;
  const highestAccuracy = displayRecords.length > 0 
    ? Math.max(...displayRecords.map(h => Math.round((h.score / h.total) * 100))) 
    : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Progress & Analytics Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Assessment Records & Cloud Sync
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track concept mastery progress and revisit previous NCERT evaluations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <Cloud className="w-3.5 h-3.5" />
              <span>Synced with Firebase</span>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign in with Google to Sync</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs font-semibold border border-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local</span>
            </button>
          )}

          <button
            onClick={onNewQuiz}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>

      {/* Cloud vs Local Switcher Tabs */}
      {user && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            All Quizzes ({displayRecords.length})
          </button>
          <button
            onClick={() => setTab('cloud')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tab === 'cloud'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Firebase Cloud ({cloudHistory.length})</span>
          </button>
          <button
            onClick={() => setTab('local')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tab === 'local'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Local Device ({history.length})</span>
          </button>
        </div>
      )}

      {/* Analytics Snapshot */}
      {displayRecords.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Completed Quizzes</span>
            <p className="text-3xl font-extrabold font-display text-white">{totalQuizzes}</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Cumulative Accuracy</span>
            <p className="text-3xl font-extrabold font-display text-emerald-400">{avgAccuracy}%</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-medium">High Score Record</span>
            <p className="text-3xl font-extrabold font-display text-cyan-400">{highestAccuracy}%</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Questions Attempted</span>
            <p className="text-3xl font-extrabold font-display text-white">{totalItems}</p>
          </div>
        </div>
      )}

      {/* History Items List */}
      <div className="space-y-4">
        {loadingCloud ? (
          <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="text-xs">Fetching cloud records from Firebase...</span>
          </div>
        ) : displayRecords.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-slate-800 bg-slate-900/30 p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display text-white">No Assessment Records Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Take your first NCERT quiz to track performance analytics, export scorecard images, and challenge your friends.
              </p>
            </div>
            <button
              onClick={onNewQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
            >
              <span>Take a Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          displayRecords.map((record) => {
            const acc = Math.round((record.score / record.total) * 100);
            return (
              <div
                key={record.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                      {record.config.class}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {record.config.subject}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {record.config.syllabusYear && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {record.config.syllabusYear}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    Topics: {record.config.topics.join(', ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-start sm:self-auto">
                  {/* Score */}
                  <div className="text-right">
                    <div className="text-lg font-bold font-display text-white">
                      {record.score}/{record.total} <span className="text-emerald-400 text-sm">({acc}%)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Time: {formatTime(record.timeSpentSeconds)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onReviewRecord(record)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      title="Review Answers & Rationales"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Review</span>
                    </button>

                    <button
                      onClick={() => onRetakeRecord(record)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-400 hover:text-slate-950 text-xs font-bold transition-all"
                      title="Retake Quiz"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Retake</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
