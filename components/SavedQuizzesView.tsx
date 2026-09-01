import React, { useState, useEffect } from 'react';
import { 
  SavedQuizRecord, 
  QuizConfig, 
  Question, 
  UserProfile,
  AppState 
} from '../types';
import { 
  fetchUserSavedQuizzes, 
  deleteSavedQuiz, 
  deleteAllSavedQuizzes, 
  saveQuizToCloudBank, 
  MAX_CLOUD_QUIZZES_LIMIT 
} from '../services/firebase';
import { PRE_SAVED_BENCHMARK_QUIZZES } from '../data/presavedQuizzes';
import { ShareReminderModal } from './ShareReminderModal';
import { 
  Database, 
  Play, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Eye, 
  X, 
  Layers, 
  Share2, 
  Search, 
  Filter,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  BookmarkCheck,
  FolderOpen,
  Bell
} from 'lucide-react';

interface SavedQuizzesViewProps {
  user: UserProfile | null;
  onPlayQuiz: (config: QuizConfig, questions: Question[]) => void;
  onNewQuiz: () => void;
  onShareQuiz?: (config: QuizConfig, questions: Question[]) => void;
  onBackHome?: () => void;
}

export const SavedQuizzesView: React.FC<SavedQuizzesViewProps> = ({
  user,
  onPlayQuiz,
  onNewQuiz,
  onShareQuiz,
  onBackHome,
}) => {
  const [cloudQuizzes, setCloudQuizzes] = useState<SavedQuizRecord[]>([]);
  const [preSavedQuizzes, setPreSavedQuizzes] = useState<Omit<SavedQuizRecord, 'userId'>[]>(() => {
    // Check if user previously deleted benchmark pre-saved quizzes locally
    try {
      const isCleared = localStorage.getItem('uquiz_presaved_cleared');
      if (isCleared === 'true') return [];
    } catch {}
    return PRE_SAVED_BENCHMARK_QUIZZES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'presaved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Question preview modal
  const [inspectingQuiz, setInspectingQuiz] = useState<SavedQuizRecord | Omit<SavedQuizRecord, 'userId'> | null>(null);
  // Share reminder modal
  const [reminderQuiz, setReminderQuiz] = useState<SavedQuizRecord | Omit<SavedQuizRecord, 'userId'> | null>(null);

  // Load user's saved quizzes from Cloud Firestore
  const loadCloudQuizzes = async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const list = await fetchUserSavedQuizzes(user.uid);
      setCloudQuizzes(list);
    } catch (err: any) {
      console.error('Failed to load cloud saved quizzes:', err);
      setError('Could not load cloud saved quizzes. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCloudQuizzes();
  }, [user?.uid]);

  // Delete a saved quiz from Cloud Vault
  const handleDeleteCloudQuiz = async (quizId: string, title: string) => {
    if (!user?.uid) return;
    if (!window.confirm(`Are you sure you want to delete "${title}" from your cloud storage vault?`)) {
      return;
    }

    try {
      setError(null);
      await deleteSavedQuiz(user.uid, quizId);
      setCloudQuizzes(prev => prev.filter(q => q.id !== quizId));
      setSuccessMsg(`Deleted "${title}" from cloud storage.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError('Failed to delete saved quiz.');
    }
  };

  // Delete a pre-saved benchmark quiz
  const handleDeletePreSavedQuiz = (quizId: string, title: string) => {
    if (!window.confirm(`Remove pre-saved template "${title}" from your library view?`)) {
      return;
    }
    setPreSavedQuizzes(prev => prev.filter(q => q.id !== quizId));
    setSuccessMsg(`Removed pre-saved template "${title}".`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Delete all pre-saved quizzes at once
  const handleClearAllPreSaved = () => {
    if (window.confirm('Are you sure you want to delete all pre-saved benchmark templates from your view?')) {
      setPreSavedQuizzes([]);
      try {
        localStorage.setItem('uquiz_presaved_cleared', 'true');
      } catch {}
      setSuccessMsg('All pre-saved benchmark templates removed.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Restore pre-saved benchmark templates
  const handleRestorePreSaved = () => {
    setPreSavedQuizzes(PRE_SAVED_BENCHMARK_QUIZZES);
    try {
      localStorage.removeItem('uquiz_presaved_cleared');
    } catch {}
    setSuccessMsg('Restored default pre-saved NCERT benchmarks.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Save a pre-saved quiz into user's own cloud vault
  const handleSaveToMyCloudVault = async (item: Omit<SavedQuizRecord, 'userId'>) => {
    if (!user?.uid) {
      setError('Please sign in to save quizzes to your cloud vault.');
      return;
    }

    if (cloudQuizzes.length >= MAX_CLOUD_QUIZZES_LIMIT) {
      setError(`Cloud Storage Quota Reached (50/50). Delete an existing quiz to free up space.`);
      return;
    }

    try {
      setError(null);
      const saved = await saveQuizToCloudBank(
        user.uid,
        item.title,
        item.config,
        item.questions,
        item.description,
        true
      );
      setCloudQuizzes(prev => [saved, ...prev]);
      setSuccessMsg(`Saved "${item.title}" to your Cloud Vault! (${cloudQuizzes.length + 1}/50 used)`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to save quiz to cloud.');
    }
  };

  // Calculate quota
  const usedSlots = cloudQuizzes.length;
  const remainingSlots = Math.max(0, MAX_CLOUD_QUIZZES_LIMIT - usedSlots);
  const quotaPercentage = Math.round((usedSlots / MAX_CLOUD_QUIZZES_LIMIT) * 100);

  // Combine lists based on filter
  let displayList: (SavedQuizRecord | (Omit<SavedQuizRecord, 'userId'> & { isPreSavedOnly?: boolean }))[] = [];
  if (filterType === 'all') {
    displayList = [
      ...cloudQuizzes,
      ...preSavedQuizzes.map(p => ({ ...p, isPreSavedOnly: true }))
    ];
  } else if (filterType === 'custom') {
    displayList = cloudQuizzes;
  } else if (filterType === 'presaved') {
    displayList = preSavedQuizzes.map(p => ({ ...p, isPreSavedOnly: true }));
  }

  // Filter with search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayList = displayList.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.config.subject.toLowerCase().includes(q) ||
      item.config.class.toLowerCase().includes(q) ||
      item.config.topics.some(t => t.toLowerCase().includes(q))
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Cloud Storage Vault Header & Quota Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            {onBackHome && (
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={onBackHome}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-purple-400 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Dashboard</span>
                </button>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">Cloud Assessment Bank</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <Database className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
                  Cloud Quiz Vault
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  10 Limit
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Store your latest 10 custom and pre-saved NCERT assessments securely in the Cloud Vault. Retake them anytime, manage templates, and share challenge links.
            </p>
          </div>

          {/* Action CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNewQuiz}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>
          </div>
        </div>

        {/* 50-Quiz Limit Quota Bar */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Cloud Storage Quota:</span>
              <span className="font-mono font-bold text-purple-400">
                {usedSlots} / {MAX_CLOUD_QUIZZES_LIMIT} Quizzes Used
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({remainingSlots} slots remaining)
              </span>
            </div>
            <span className={`font-mono font-bold ${
              usedSlots >= 45 ? 'text-rose-400' : usedSlots >= 35 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {quotaPercentage}% Capacity
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usedSlots >= 48
                  ? 'bg-rose-500'
                  : usedSlots >= 35
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, quotaPercentage))}%` }}
            />
          </div>

          {usedSlots >= MAX_CLOUD_QUIZZES_LIMIT && (
            <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Vault is full (10/10). Delete some quizzes below to save fresh assessments.</span>
            </div>
          )}
        </div>

      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Toolbar: Search, Filters, and Management Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            All Available ({cloudQuizzes.length + preSavedQuizzes.length})
          </button>

          <button
            onClick={() => setFilterType('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'custom'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>My Cloud Vault ({cloudQuizzes.length}/10)</span>
          </button>

          <button
            onClick={() => setFilterType('presaved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'presaved'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Pre-Saved NCERT Benchmarks ({preSavedQuizzes.length})</span>
          </button>
        </div>

        {/* Search & Extra Actions */}
        <div className="flex items-center gap-2">
          
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved quizzes..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          {/* Quick Pre-saved cleanup buttons */}
          {preSavedQuizzes.length > 0 ? (
            <button
              onClick={handleClearAllPreSaved}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs transition-colors shrink-0 cursor-pointer"
              title="Delete all pre-saved benchmark templates"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleRestorePreSaved}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-purple-400 text-xs transition-colors shrink-0 cursor-pointer"
              title="Restore default benchmark templates"
            >
              Restore Templates
            </button>
          )}

        </div>

      </div>

      {/* Grid of Saved Quizzes */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Accessing Cloud Storage Vault...</p>
        </div>
      ) : displayList.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Quizzes Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchQuery ? 'No quizzes match your search filter.' : 'Your cloud vault has 50 free slots available. Generate an assessment or browse curricula to save them here.'}
            </p>
          </div>
          <button
            onClick={onNewQuiz}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Generate & Save a Quiz</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayList.map((quiz) => {
            const isPreSavedItem = 'isPreSavedOnly' in quiz && quiz.isPreSavedOnly;

            return (
              <div
                key={quiz.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
              >
                <div className="space-y-3">
                  
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {quiz.config.class}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-slate-800 text-slate-300">
                        {quiz.config.subject}
                      </span>
                    </div>

                    {isPreSavedItem ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Pre-Saved Benchmark
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Cloud Vault
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {quiz.description || quiz.config.topics.join(', ')}
                    </p>
                  </div>

                  {/* Parameters Grid */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-mono">
                      {quiz.questions.length} Qs
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-mono">
                      {quiz.config.strength}
                    </span>
                    {quiz.config.timeLimitMinutes ? (
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-mono">
                        {quiz.config.timeLimitMinutes} min limit
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-mono">
                        Untimed
                      </span>
                    )}
                    {quiz.config.syllabusYear && (
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] font-mono">
                        {quiz.config.syllabusYear}
                      </span>
                    )}
                  </div>

                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  
                  {/* Play Primary Action */}
                  <button
                    onClick={() => onPlayQuiz(quiz.config, quiz.questions)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Assessment</span>
                  </button>

                  {/* Share Reminder Button */}
                  <button
                    onClick={() => setReminderQuiz(quiz)}
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-colors cursor-pointer"
                    title="Send a study reminder with direct link"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>

                  {/* Question Inspection Eye */}
                  <button
                    onClick={() => setInspectingQuiz(quiz)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Inspect questions & answer keys"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Save to Cloud Slot if pre-saved */}
                  {isPreSavedItem && (
                    <button
                      onClick={() => handleSaveToMyCloudVault(quiz)}
                      className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 transition-colors cursor-pointer"
                      title="Save a copy to your 50-limit Cloud Vault"
                    >
                      <Database className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete Button (Cloud or Pre-Saved) */}
                  {isPreSavedItem ? (
                    <button
                      onClick={() => handleDeletePreSavedQuiz(quiz.id, quiz.title)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                      title="Delete this pre-saved quiz template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteCloudQuiz(quiz.id, quiz.title)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                      title="Delete saved quiz from Cloud Vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Share Reminder Modal */}
      {reminderQuiz && (
        <ShareReminderModal
          quizTitle={reminderQuiz.title}
          config={reminderQuiz.config}
          quizId={reminderQuiz.id}
          onClose={() => setReminderQuiz(null)}
        />
      )}

      {/* Quiz Questions Preview Modal */}
      {inspectingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col space-y-5 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {inspectingQuiz.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {inspectingQuiz.config.class} • {inspectingQuiz.config.subject} • {inspectingQuiz.questions.length} Questions
                </p>
              </div>
              <button
                onClick={() => setInspectingQuiz(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {inspectingQuiz.questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5 text-xs">
                  <div className="font-bold text-white text-sm">
                    Q{idx + 1}. {q.question}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = opt.trim() === q.correctAnswer.trim();
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs ${
                            isCorrect 
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold' 
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="pt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-semibold text-emerald-400">NCERT Solution: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectingQuiz(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close Preview
              </button>

              <button
                onClick={() => {
                  const conf = inspectingQuiz.config;
                  const qList = inspectingQuiz.questions;
                  setInspectingQuiz(null);
                  onPlayQuiz(conf, qList);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch This Quiz</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
