import React, { useState, useEffect } from 'react';
import { QuizConfig } from '../types';
import { Sparkles, BrainCircuit, BookOpen, CheckCircle2, ShieldCheck, Atom } from 'lucide-react';

interface LoadingViewProps {
  config: QuizConfig;
  onCancel: () => void;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ config, onCancel }) => {
  const [stage, setStage] = useState(0);

  const stages = [
    'Connecting to NCERT Unified Knowledge Matrix...',
    `Scanning ${config.class} • ${config.subject} Syllabus...`,
    `Synthesizing ${config.quantity} items for [${config.topics.slice(0, 2).join(', ')}${config.topics.length > 2 ? ` +${config.topics.length - 2} more` : ''}]...`,
    `Calibrating ${config.strength} Cognitive Demand & Question Rationales...`,
    'Validating KaTeX Mathematical & Scientific Notations...',
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
    }, 2200);

    const quoteTimer = setInterval(() => {
      setActiveQuoteIdx(q => (q + 1) % quotes.length);
    }, 5000);

    return () => {
      clearInterval(stageTimer);
      clearInterval(quoteTimer);
    };
  }, []);

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
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Drafting Your NCERT Assessment
          </h2>
          <p className="text-sm font-mono text-emerald-400 font-semibold h-6 transition-all duration-300">
            {stages[stage]}
          </p>
        </div>

        {/* Progress Stages Checkpoints */}
        <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-left">
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
            className="text-xs text-slate-500 hover:text-slate-300 font-mono underline transition-colors"
          >
            Cancel Generation
          </button>
        </div>

      </div>
    </div>
  );
};
