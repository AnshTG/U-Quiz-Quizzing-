import React, { useState } from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  Cloud, 
  ShieldCheck, 
  CheckCircle2, 
  Flame, 
  BookOpen, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  Database
} from 'lucide-react';

interface LoginViewProps {
  onSignIn: () => Promise<void>;
  onOpenAdminAuth: () => void;
  error?: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSignIn,
  onOpenAdminAuth,
  error
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(error || null);

  const handleGoogleClick = async () => {
    try {
      setIsLoading(true);
      setLocalError(null);
      await onSignIn();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      setLocalError(err.message || 'Google Sign-in encountered an issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-extrabold text-3xl text-emerald-400 font-display">U</span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-white flex items-center justify-center gap-2">
              <span>U Quiz</span>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
                NCERT AI
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              CBSE Class 9 & 10 Syllabus Assessment & Cloud Engine
            </p>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Sign In Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authenticate with your Google account to access interactive NCERT tests, your 50-quiz Cloud Storage Vault, and real-time performance analytics.
            </p>
          </div>

          {/* Error Alert */}
          {(localError || error) && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl shadow-white/5 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            )}
            <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />}
          </button>

          {/* Key Capabilities Badges */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              What you get with your account
            </div>
            
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">50-Quiz Cloud Storage Vault:</strong> Save & organize your favorite tests</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">Gemini AI Test Generator:</strong> Class 9 & 10 NCF-SE / Rationalized</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">Persistent Analytics:</strong> Real-time accuracy and history sync</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info & Admin Panel Gateway */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <span>Secured with Enterprise Cloud Encryption</span>
          <button
            onClick={onOpenAdminAuth}
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>
        </div>

      </div>
    </div>
  );
};
