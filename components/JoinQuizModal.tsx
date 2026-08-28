import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, QrCode, Search } from 'lucide-react';

interface JoinQuizModalProps {
  onJoinQuiz: (quizId: string) => void;
  onClose: () => void;
}

export const JoinQuizModal: React.FC<JoinQuizModalProps> = ({
  onJoinQuiz,
  onClose,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setError('Please enter a valid Quiz Code or Challenge Link.');
      return;
    }

    // Extract ID from full URL or use raw ID
    let parsedId = inputCode.trim();
    try {
      if (parsedId.includes('quizId=')) {
        const url = new URL(parsedId.startsWith('http') ? parsedId : `https://${parsedId}`);
        const idParam = url.searchParams.get('quizId');
        if (idParam) parsedId = idParam;
      } else if (parsedId.includes('#quiz=')) {
        parsedId = parsedId.split('#quiz=')[1];
      }
    } catch {
      // Use raw input
    }

    onJoinQuiz(parsedId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Join Shared Quiz</h3>
              <p className="text-xs text-slate-400">Enter a quiz code or link shared by a friend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Quiz Code or Challenge Link
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. q_7x9f1a or paste full link"
                value={inputCode}
                onChange={e => {
                  setInputCode(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-rose-400 font-medium">{error}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Load Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
