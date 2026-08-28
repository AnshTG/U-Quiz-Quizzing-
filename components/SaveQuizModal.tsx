import React, { useState } from 'react';
import { QuizConfig, Question, UserProfile, SavedQuizRecord } from '../types';
import { saveQuizToCloudBank, MAX_CLOUD_QUIZZES_LIMIT } from '../services/firebase';
import { Database, CheckCircle2, AlertCircle, X, Bookmark, Sparkles } from 'lucide-react';

interface SaveQuizModalProps {
  config: QuizConfig;
  questions: Question[];
  user: UserProfile | null;
  onSaved: (savedRecord: SavedQuizRecord) => void;
  onClose: () => void;
  onSignIn: () => void;
}

export const SaveQuizModal: React.FC<SaveQuizModalProps> = ({
  config,
  questions,
  user,
  onSaved,
  onClose,
  onSignIn
}) => {
  const defaultTitle = `${config.class} ${config.subject}: ${config.topics.slice(0, 2).join(', ') || 'Comprehensive Assessment'}`;
  const defaultDesc = `${config.topics.join(', ')} (${questions.length} Qs, ${config.strength} Difficulty, ${config.syllabusYear || '2026-27'})`;

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDesc);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      setError('You must be signed in with Google to store quizzes to the cloud.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const savedRecord = await saveQuizToCloudBank(
        user.uid,
        title,
        config,
        questions,
        description
      );
      onSaved(savedRecord);
    } catch (err: any) {
      setError(err.message || 'Failed to save quiz to cloud vault.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-display text-white">
                Store Quiz to Cloud Vault
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300">
                Max 50 Slots
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Save this {questions.length}-question assessment to your personal cloud repository.
            </p>
          </div>
        </div>

        {/* Not Logged In Warning */}
        {!user?.uid ? (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Sign In Required</h4>
              <p className="text-xs text-slate-400">
                You must be authenticated with Google to persist quizzes to your cloud vault.
              </p>
            </div>
            <button
              onClick={onSignIn}
              className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-md"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Quiz Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Notes & Syllabus Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={200}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400 transition-colors resize-none"
              />
            </div>

            {/* Parameter Preview Pill */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] flex flex-wrap gap-2 text-slate-400 font-mono">
              <span>{config.class}</span>
              <span>•</span>
              <span>{config.subject}</span>
              <span>•</span>
              <span>{questions.length} Questions</span>
              <span>•</span>
              <span>{config.strength}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Store to Cloud Vault</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
