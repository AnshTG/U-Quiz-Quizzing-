import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { QuizConfig, Question, UserProfile } from '../types';
import { MathText } from './MathText';
import { 
  Download, 
  Share2, 
  X, 
  Award, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Loader2, 
  Check 
} from 'lucide-react';

interface ScorecardExportModalProps {
  config: QuizConfig;
  questions: Question[];
  userAnswers: (string | null)[];
  timeSpentSeconds: number;
  user: UserProfile | null;
  onClose: () => void;
}

export const ScorecardExportModal: React.FC<ScorecardExportModalProps> = ({
  config,
  questions,
  userAnswers,
  timeSpentSeconds,
  user,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute score
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] && userAnswers[idx]?.trim() === q.correctAnswer.trim()) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  const getTier = () => {
    if (percentage >= 90) return { title: 'NCERT Master', badge: 'Tier 1 • Elite', color: 'from-emerald-400 to-teal-300', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (percentage >= 75) return { title: 'NCERT Proficient', badge: 'Tier 2 • Advanced', color: 'from-lime-400 to-emerald-400', bg: 'bg-lime-500/10 text-lime-400 border-lime-500/30' };
    if (percentage >= 50) return { title: 'NCERT Developing', badge: 'Tier 3 • Solid', color: 'from-amber-400 to-yellow-300', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { title: 'NCERT Foundation', badge: 'Tier 4 • Reviewer', color: 'from-rose-400 to-orange-400', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  };

  const tier = getTier();

  // Generate PNG image data URL
  const generateImageBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      quality: 0.98,
      pixelRatio: 2, // High resolution for crisp social sharing
      cacheBust: true,
      backgroundColor: '#090d14'
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  // Download scorecard image
  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      if (!cardRef.current) return;

      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#090d14'
      });

      const link = document.createElement('a');
      const filename = `UQuiz_${config.class.replace(/\s+/g, '')}_${config.subject.replace(/[^a-zA-Z0-9]/g, '')}_Scorecard.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error('Image generation error:', err);
      setError('Could not export scorecard image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Share directly through device Web Share API with image file attachment
  const handleDirectShare = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const blob = await generateImageBlob();
      if (!blob) throw new Error('Failed to create image');

      const filename = `uquiz_${config.class.toLowerCase().replace(/\s+/g, '_')}_scorecard.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      // Check if Web Share API with files is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `My NCERT Assessment Scorecard: ${percentage}%`,
          text: `I scored ${correctCount}/${questions.length} (${percentage}%) in ${config.class} ${config.subject} on U Quiz AI! 🎓 Practice at https://uquizzes.vercel.app`,
          files: [file],
        });
        setSharedSuccess(true);
        setTimeout(() => setSharedSuccess(false), 3000);
      } else {
        // Fallback: Download file and copy text
        const dataUrl = await toPng(cardRef.current!, { quality: 0.98, pixelRatio: 2, cacheBust: true, backgroundColor: '#090d14' });
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        if (navigator.clipboard) {
          await navigator.clipboard.writeText(`I scored ${correctCount}/${questions.length} (${percentage}%) in ${config.class} ${config.subject} on U Quiz AI! 🚀 Practice at https://uquizzes.vercel.app`);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Direct share error:', err);
        setError('Direct sharing was cancelled or not supported. You can download the image instead.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Export NCERT Scorecard</h3>
              <p className="text-xs text-slate-400">Share your official assessment result as an image</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* The Visual Scorecard (Target element captured by html-to-image) */}
        <div className="flex justify-center">
          <div 
            ref={cardRef}
            className="w-full max-w-md bg-[#0c121d] border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden space-y-5"
            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            {/* Ambient Background Gradients */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

            {/* Header: Brand & Badge */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-400 p-0.5 shadow-md">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <span className="font-extrabold text-sm text-emerald-400">U</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-white tracking-tight">U Quiz AI</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                      NCERT
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Official Assessment Report</span>
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${tier.bg}`}>
                {tier.badge}
              </div>
            </div>

            {/* Candidate Identity */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Candidate'}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full border border-emerald-400/40 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-white block">
                    {user?.displayName || 'NCERT Scholar'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Syllabus Edition</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {config.syllabusYear || '2026-27'}
                </span>
              </div>
            </div>

            {/* Hero Score Showcase */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 rounded-2xl p-5 text-center relative z-10 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {config.class} • {config.subject}
              </span>

              <div className="flex items-center justify-center gap-6 py-1">
                <div>
                  <div className="text-4xl font-extrabold text-white font-display tracking-tight">
                    {correctCount}<span className="text-xl text-slate-500 font-normal">/{questions.length}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Score</span>
                </div>
                <div className="w-px h-10 bg-slate-800" />
                <div>
                  <div className={`text-4xl font-extrabold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${tier.color}`}>
                    {percentage}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Accuracy</span>
                </div>
              </div>

              <p className="text-xs font-medium text-slate-300">
                {tier.title} • {config.strength} Cognitive Demand
              </p>
            </div>

            {/* Quick Metrics & Topics */}
            <div className="grid grid-cols-2 gap-2 text-left relative z-10 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Time Invested</span>
                <span className="font-bold text-cyan-400 font-mono">{formatTime(timeSpentSeconds)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Pacing Average</span>
                <span className="font-bold text-emerald-400 font-mono">
                  ~{Math.round(timeSpentSeconds / questions.length)}s / question
                </span>
              </div>
            </div>

            {/* Footer watermark & Verification Tag */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono relative z-10">
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Verified by Gemini AI
              </span>
              <span>ai.studio/build • U Quiz</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDirectShare}
              disabled={isGenerating}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : sharedSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>{sharedSuccess ? 'Shared Successfully!' : copied ? 'Score Copied!' : 'Share Image Directly'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-emerald-400" />
              )}
              <span>Download PNG Image</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            The generated image format is optimized for WhatsApp, Instagram Stories, Twitter/X, and student study groups.
          </p>
        </div>

      </div>
    </div>
  );
};
