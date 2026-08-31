import React, { useState } from 'react';
import { QuizConfig, Question, UserProfile } from '../types';
import { publishSharedQuiz } from '../services/firebase';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  ExternalLink, 
  QrCode, 
  Loader2, 
  Globe, 
  Users 
} from 'lucide-react';

interface ShareQuizModalProps {
  config: QuizConfig;
  questions: Question[];
  user: UserProfile | null;
  existingQuizId?: string;
  onClose: () => void;
}

export const ShareQuizModal: React.FC<ShareQuizModalProps> = ({
  config,
  questions,
  user,
  existingQuizId,
  onClose,
}) => {
  const [quizId, setQuizId] = useState<string | null>(existingQuizId || null);
  const [isPublishing, setIsPublishing] = useState<boolean>(!existingQuizId);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Publish to Firestore on mount if not already published
  React.useEffect(() => {
    if (!quizId) {
      const publish = async () => {
        try {
          setIsPublishing(true);
          const publishedId = await publishSharedQuiz(config, questions, user);
          setQuizId(publishedId);
        } catch (err: any) {
          console.error('Publish error:', err);
          setError('Failed to create shareable challenge link. Please check your internet connection.');
        } finally {
          setIsPublishing(false);
        }
      };
      publish();
    }
  }, [config, questions, user, quizId]);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
      return window.location.origin;
    }
    return 'https://uquizzes.vercel.app';
  };

  const shareUrl = quizId 
    ? `${getBaseUrl()}?quizId=${quizId}`
    : '';

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  const handleCopyCode = async () => {
    if (!quizId) return;
    try {
      await navigator.clipboard.writeText(quizId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl || !quizId) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Challenge: ${config.class} ${config.subject} Quiz`,
          text: `Take my custom NCERT quiz on ${config.class} ${config.subject} (${config.quantity} Questions) on U Quiz AI! 🎯`,
          url: shareUrl,
        });
      } else {
        handleCopyLink();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handleCopyLink();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Share Quiz Challenge</h3>
              <p className="text-xs text-slate-400">Anyone with this link can play this exact quiz on their device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading state */}
        {isPublishing ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-300">Generating secure cloud challenge link...</p>
            <p className="text-xs text-slate-500">Syncing questions with Firebase database</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-2">
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setQuizId(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs"
            >
              Retry Publishing
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Quiz Info Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  {config.class} • {config.subject}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {config.quantity} Questions
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">
                Topics: {config.topics.join(', ')}
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Created by <strong className="text-white">{user?.displayName || 'NCERT Scholar'}</strong></span>
              </div>
            </div>

            {/* Direct Share Link Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Shareable Challenge URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono select-all focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Quick Quiz Code Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Quiz Access Code (for direct entry on other devices)
              </label>
              <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block uppercase">Quiz Code</span>
                  <span className="text-base font-bold font-mono text-emerald-400 tracking-wider">
                    {quizId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Code Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Native Share CTA */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Challenge with Friends</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
