import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, X, Check } from 'lucide-react';
import { verifyAdminPassword } from '../services/firebase';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  onSuccess,
  onClose
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the admin security password.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await verifyAdminPassword(passcode.trim());
      if (isValid) {
        setIsVerifying(false);
        onSuccess();
      } else {
        setIsVerifying(false);
        setError('Incorrect administrator password. Access denied.');
        setPasscode('');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setError('Authentication check encountered an error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-display text-white">
            Admin Portal Authentication
          </h3>
          <p className="text-xs text-slate-400">
            Enter the administrator security password to inspect active users, system progress, and cloud databases.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Security Password / Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={12}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter administrator password"
                autoFocus
                className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700 rounded-xl text-center text-xl font-mono tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-slate-500 text-center font-mono">
              Authorized personnel only
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify & Enter</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
