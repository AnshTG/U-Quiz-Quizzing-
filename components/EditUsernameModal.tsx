import React, { useState, useEffect } from 'react';
import { AtSign, Check, AlertCircle, Loader2, Sparkles, X, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { checkUsernameAvailability, updateUserCustomUsername, sanitizeUsernameCandidate } from '../services/firebase';

interface EditUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUsernameUpdated?: (newUsername: string) => void;
}

export const EditUsernameModal: React.FC<EditUsernameModalProps> = ({
  isOpen,
  onClose,
  user,
  onUsernameUpdated
}) => {
  const [candidate, setCandidate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; error?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize input with current username or generated candidate
  useEffect(() => {
    if (isOpen && user) {
      const current = user.username || sanitizeUsernameCandidate(user.displayName || user.email?.split('@')[0] || 'scholar');
      setCandidate(current);
      setAvailability({ available: true });
      setSaveSuccess(false);
      setSaveError(null);
    }
  }, [isOpen, user]);

  // Debounced availability check
  useEffect(() => {
    if (!isOpen || !user) return;
    const clean = candidate.trim().toLowerCase();
    
    if (!clean) {
      setAvailability({ available: false, error: 'Handle cannot be empty.' });
      return;
    }

    if (clean === user.username?.toLowerCase()) {
      setAvailability({ available: true });
      return;
    }

    if (clean.length < 3) {
      setAvailability({ available: false, error: 'Must be at least 3 characters.' });
      return;
    }

    if (clean.length > 25) {
      setAvailability({ available: false, error: 'Maximum 25 characters allowed.' });
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setAvailability({ available: false, error: 'Only letters, numbers, and underscores allowed.' });
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(clean, user.uid);
        setAvailability(result);
      } catch {
        setAvailability({ available: true });
      } finally {
        setIsChecking(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [candidate, isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availability?.available || isChecking || isSaving) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      const res = await updateUserCustomUsername(user, candidate.trim().toLowerCase());
      if (res.success && res.username) {
        setSaveSuccess(true);
        if (onUsernameUpdated) {
          onUsernameUpdated(res.username);
        }
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setSaveError(res.error || 'Could not update username. Please try another.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateSuggestion = (variant: 'clean' | 'random' | 'smart') => {
    const base = sanitizeUsernameCandidate(user.displayName || user.email?.split('@')[0] || 'scholar');
    if (variant === 'clean') {
      setCandidate(base);
    } else if (variant === 'random') {
      setCandidate(`${base}_${Math.floor(10 + Math.random() * 90)}`);
    } else {
      const suffixes = ['cbse', 'ncert', 'topper', 'scholar', 'rank1'];
      const pick = suffixes[Math.floor(Math.random() * suffixes.length)];
      setCandidate(`${base}_${pick}`.slice(0, 24));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <AtSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              Customize Scholar Handle
            </h3>
            <p className="text-xs text-slate-400">
              Your unique handle for P2P direct chat and leaderboards
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Input field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Unique Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 font-mono font-bold text-sm select-none">
                @
              </span>
              <input
                type="text"
                value={candidate}
                onChange={(e) => setCandidate(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="scholar_handle"
                maxLength={25}
                className={`w-full pl-8 pr-10 py-2.5 bg-slate-950 border rounded-xl font-mono text-sm text-white placeholder-slate-500 outline-none transition-all ${
                  availability?.available
                    ? 'border-emerald-500/50 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                    : availability?.error
                    ? 'border-rose-500/60 focus:border-rose-400 focus:ring-1 focus:ring-rose-400'
                    : 'border-slate-800 focus:border-slate-700'
                }`}
              />
              <div className="absolute right-3 flex items-center">
                {isChecking ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : availability?.available ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : availability?.error ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : null}
              </div>
            </div>

            {/* Availability feedback */}
            <div className="mt-1.5 min-h-[20px]">
              {isChecking ? (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  Checking handle availability...
                </span>
              ) : availability?.available ? (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  @{candidate} is available!
                </span>
              ) : availability?.error ? (
                <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {availability.error}
                </span>
              ) : null}
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => generateSuggestion('clean')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Clean Name
              </button>
              <button
                type="button"
                onClick={() => generateSuggestion('random')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                With Numbers
              </button>
              <button
                type="button"
                onClick={() => generateSuggestion('smart')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Study Tag
              </button>
            </div>
          </div>

          {/* Rules info */}
          <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
            <li>3–25 characters in length</li>
            <li>Lowercase letters, numbers, and underscores only</li>
            <li>Guaranteed unique across all scholars on the platform</li>
          </ul>

          {saveError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Handle successfully reserved and updated!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!availability?.available || isChecking || isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-emerald-500/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Handle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
