import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { QuizConfig, Question, UserProfile } from '../types';
import { MathText } from './MathText';
import { 
  Download, 
  Share2, 
  X, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Image as ImageIcon,
  Palette,
  Sun,
  Moon
} from 'lucide-react';

interface RationaleExportModalProps {
  config: QuizConfig;
  questions: Question[];
  userAnswers: (string | null)[];
  initialQuestionIndex?: number;
  user: UserProfile | null;
  onClose: () => void;
}

export const RationaleExportModal: React.FC<RationaleExportModalProps> = ({
  config,
  questions,
  userAnswers,
  initialQuestionIndex = 0,
  user,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(
    Math.max(0, Math.min(initialQuestionIndex, questions.length - 1))
  );
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentAnswer = userAnswers[currentIndex];
  const isCorrect = currentAnswer && currentAnswer.trim() === currentQ.correctAnswer.trim();

  // Generate PNG Blob
  const generateBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      quality: 0.98,
      pixelRatio: 2, // High resolution for crisp mobile sharing and printouts
      cacheBust: true,
      backgroundColor: theme === 'dark' ? '#090d14' : '#ffffff'
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  // Download image file
  const handleDownloadImage = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      if (!cardRef.current) return;

      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: theme === 'dark' ? '#090d14' : '#ffffff'
      });

      const link = document.createElement('a');
      const safeSubject = config.subject.replace(/[^a-zA-Z0-9]/g, '');
      const filename = `UQuiz_${config.class.replace(/\s+/g, '')}_${safeSubject}_Q${currentIndex + 1}_Rationale.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err: any) {
      console.error('Rationale image export error:', err);
      setError('Could not export rationale image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Share or Copy Image to Clipboard
  const handleShareOrCopyImage = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const blob = await generateBlob();
      if (!blob) throw new Error('Image generation failed');

      const filename = `uquiz_${config.class.toLowerCase().replace(/\s+/g, '_')}_q${currentIndex + 1}_rationale.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      // Try Web Share API with files if supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `NCERT Solution Rationale: Q${currentIndex + 1} (${config.class} ${config.subject})`,
          text: `NCERT Solution & Step-by-Step Rationale for ${config.class} ${config.subject} from U Quiz AI.`,
          files: [file],
        });
      } else if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        // Copy image blob directly to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        // Fallback: download the file
        await handleDownloadImage();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share/copy error:', err);
        setError('Device sharing was cancelled. Use Download Image instead.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy raw text rationale
  const handleCopyText = () => {
    const text = `NCERT Question Q${currentIndex + 1} (${config.class} ${config.subject})\n\nQuestion: ${currentQ.question}\n\nCorrect Answer: ${currentQ.correctAnswer}\n\nNCERT Concept Rationale: ${currentQ.explanation}\n\nGenerated via U Quiz AI (https://uquizzes.vercel.app)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl relative my-auto">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white">
                Save Quiz Rationale Solution in Image Format
              </h3>
              <p className="text-xs text-slate-400">
                High-resolution NCERT study card with step-by-step conceptual solution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Selector Tabs & Theme Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
          
          {/* Question pagination pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs transition-colors cursor-pointer shrink-0"
              title="Previous question"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {questions.map((_, idx) => {
              const ans = userAnswers[idx];
              const correct = ans && ans.trim() === questions[idx].correctAnswer.trim();
              const isSelected = currentIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                      : correct
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                >
                  Q{idx + 1}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs transition-colors cursor-pointer shrink-0"
              title="Next question"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Switcher: Dark Flashcard vs Clean Light Print */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">Style:</span>
            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* The Live Rationale Solution Card Target (captured by html-to-image) */}
        <div className="flex justify-center overflow-x-auto py-1">
          <div 
            ref={cardRef}
            className={`w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-4 border transition-colors ${
              theme === 'dark' 
                ? 'bg-[#0b1019] border-slate-800 text-white' 
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            {/* Ambient Accent Gradients (Dark Mode Only) */}
            {theme === 'dark' && (
              <>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
              </>
            )}

            {/* Brand Header & Tag */}
            <div className="flex items-center justify-between border-b pb-3.5 relative z-10"
                 style={{ borderColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : '#e2e8f0' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-400 p-0.5 shadow-md shrink-0">
                  <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-900'}`}>
                    <span className="font-extrabold text-sm text-emerald-400">U</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-sm tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      U Quiz AI
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase border ${
                      theme === 'dark' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      NCERT Solution
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {config.class} • {config.subject} • CBSE 2026-27
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] font-mono block uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Question Item
                </span>
                <span className={`text-sm font-extrabold font-mono ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Q{currentIndex + 1} of {questions.length}
                </span>
              </div>
            </div>

            {/* Question Statement */}
            <div className="space-y-2 relative z-10 pt-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                  theme === 'dark' 
                    ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}>
                  Question Prompt
                </span>
              </div>
              <div className={`text-sm sm:text-base font-semibold leading-relaxed ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
              }`}>
                <MathText content={currentQ.question} />
              </div>
            </div>

            {/* Correct Key Answer Box */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2.5 relative z-10 ${
              theme === 'dark'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <div className="text-xs font-semibold leading-snug">
                  <span className={`font-bold font-mono mr-1.5 uppercase ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Correct Key:
                  </span>
                  <MathText content={currentQ.correctAnswer} />
                </div>
              </div>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                theme === 'dark'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-emerald-200 text-emerald-900 border border-emerald-400'
              }`}>
                NCERT Validated
              </span>
            </div>

            {/* Detailed Step-by-Step Pedagogical Rationale */}
            <div className={`p-4 rounded-2xl border space-y-2 relative z-10 ${
              theme === 'dark'
                ? 'bg-slate-950/85 border-slate-800 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 font-bold text-xs font-mono ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Step-by-Step Conceptual Rationale:</span>
                </div>
                <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Formula &amp; Theory
                </span>
              </div>

              <div className={`text-xs leading-relaxed ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <MathText content={currentQ.explanation} />
              </div>
            </div>

            {/* Card Footer: Metadata, Watermark & Date */}
            <div className="flex items-center justify-between pt-2 text-[10px] font-mono border-t relative z-10"
                 style={{ borderColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : '#e2e8f0' }}>
              <div className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                <span>Aligned with NCF-SE 2026-27 Curriculum</span>
              </div>
              <div className={`font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                <span>uquizzes.vercel.app</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Export Buttons */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Download Image Button */}
            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Image Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Solution Image (PNG)</span>
                </>
              )}
            </button>

            {/* Share or Copy Image Button */}
            <button
              onClick={handleShareOrCopyImage}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition-all hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Image Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Share / Copy Image</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Copy Text Button & Navigation Helper */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs text-slate-400">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Text Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Solution Text</span>
                </>
              )}
            </button>

            <span className="text-[11px] font-mono text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
