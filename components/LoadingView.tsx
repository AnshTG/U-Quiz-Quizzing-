import React, { useState, useEffect } from 'react';
import { QuizConfig } from '../types';
import { Sparkles, Atom, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface LoadingViewProps {
  config: QuizConfig;
  onCancel: () => void;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ config, onCancel }) => {
  const [stage, setStage] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const stages = [
    'Connecting to NCERT Unified Knowledge Matrix...',
    `Scanning ${config.class} • ${config.subject} Syllabus...`,
    `Synthesizing ${config.quantity} items for [${config.topics.slice(0, 2).join(', ')}${config.topics.length > 2 ? ` +${config.topics.length - 2} more` : ''}]...`,
    `Calibrating ${config.strength} Cognitive Demand & Rationales...`,
    'Finalizing Mathematical Formulas & Response Verification...',
  ];

  const quotes = [
    { quote: "An equation for me has no meaning, unless it represents a thought of God.", author: "Srinivasa Ramanujan" },
    { quote: "Science is a collaborative effort, building on the discoveries of those before us.", author: "Sir C. V. Raman" },
    { quote: "Learning gives creativity, creativity leads to thinking, thinking provides knowledge, knowledge makes you great.", author: "Dr. A. P. J. Abdul Kalam" },
    { quote: "Education is the manifestation of the perfection already in man.", author: "Swami Vivekananda" },
  ];

  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setStage(s => (s < stages.length - 1 ? s + 1 : s));
    }, 2400);

    const timer = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);

    const quoteTimer = setInterval(() => {
      setActiveQuoteIdx(q => (q + 1) % quotes.length);
    }, 5000);

    return () => {
      clearInterval(stageTimer);
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl text-center space-y-8">
        
        {/* Animated Visual Ring */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-lime-400 border-l-transparent animate-spin" />
          <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl shadow-emerald-500/10">
            <Atom className="w-10 h-10 text-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Title & Stage */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Drafting NCERT Assessment
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-semibold">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{formatElapsed(elapsedSeconds)}</span>
            </div>
          </div>
          
          <p className="text-sm font-mono text-emerald-400 font-semibold min-h-[24px] transition-all duration-300">
            {stages[stage]}
          </p>

          {elapsedSeconds > 15 && (
            <p className="text-xs text-amber-300/80 font-mono animate-pulse">
              ⚡ Serverless AI is parsing textbook concepts and formatting equations...
            </p>
          )}
        </div>

        {/* Progress Stages Checkpoints */}
        <div className="space-y-2 bg-slate-900/70 p-4 rounded-2xl border border-slate-800 text-left backdrop-blur-sm">
          {stages.map((stgText, idx) => {
            const isDone = idx < stage;
            const isCurrent = idx === stage;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-3 text-xs py-1 transition-opacity ${
                  isDone ? 'text-emerald-400 font-medium' : isCurrent ? 'text-white font-bold' : 'text-slate-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className="truncate">{stgText}</span>
              </div>
            );
          })}
        </div>

        {/* Quote Card */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-950/40 text-center space-y-2">
          <p className="text-xs italic text-slate-300">
            "{quotes[activeQuoteIdx].quote}"
          </p>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold block">
            — {quotes[activeQuoteIdx].author}
          </span>
        </div>

        {/* Cancel option */}
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-rose-400 font-mono transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Generation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
