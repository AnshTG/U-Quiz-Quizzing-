import React, { useState, useEffect } from 'react';
import { QuizConfig } from '../types';
import { 
  Sparkles, 
  Atom, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Brain, 
  Lightbulb, 
  ChevronRight, 
  Trophy, 
  FileText, 
  Globe, 
  ShieldCheck,
  Flame,
  RotateCw
} from 'lucide-react';

interface LoadingViewProps {
  config: QuizConfig;
  onCancel: () => void;
}

interface BrainTeaser {
  question: string;
  options: string[];
  correct: number;
  funFact: string;
  category: 'Physics' | 'Math' | 'Chemistry' | 'Biology' | 'Riddle';
}

const TRIVIA_QUESTIONS: BrainTeaser[] = [
  {
    category: 'Physics',
    question: 'Why is the sky blue on Earth, but black on the Moon?',
    options: [
      'Atmospheric Rayleigh scattering',
      'The Moon has no sunlight',
      'Refraction from ocean waters',
      'Ozone layer color reflection'
    ],
    correct: 0,
    funFact: 'Shorter blue wavelengths scatter much more strongly in gases than red wavelengths (Rayleigh scattering).'
  },
  {
    category: 'Math',
    question: 'What is the only prime number that is also an even number?',
    options: ['0', '1', '2', '4'],
    correct: 2,
    funFact: '2 is the only even prime! Every other even number is divisible by 2 and thus composite.'
  },
  {
    category: 'Chemistry',
    question: 'Which element is liquid at standard room temperature and pressure?',
    options: ['Bromine (Br₂)', 'Chlorine (Cl₂)', 'Gallium (Ga)', 'Cesium (Cs)'],
    correct: 0,
    funFact: 'Only two elements on the periodic table are liquid at standard room temp: Bromine (a non-metal) and Mercury (a metal).'
  },
  {
    category: 'Biology',
    question: 'What is the powerhouse organelle of the eukaryotic cell?',
    options: ['Ribosome', 'Mitochondria', 'Golgi Apparatus', 'Endoplasmic Reticulum'],
    correct: 1,
    funFact: 'Mitochondria generate over 90% of cellular ATP energy and contain their own distinct circular DNA.'
  },
  {
    category: 'Riddle',
    question: 'I have keys but no locks. I have space but no rooms. You can enter, but you cannot go outside. What am I?',
    options: ['A Piano', 'A Keyboard', 'A Map', 'A Dictionary'],
    correct: 1,
    funFact: 'A computer keyboard has Space, Enter, Escape, and keys, but no doors or rooms!'
  },
  {
    category: 'Physics',
    question: 'What happens to the speed of light when it enters water from air?',
    options: ['It accelerates', 'It slows down', 'It stays identical', 'It stops completely'],
    correct: 1,
    funFact: 'In water, light slows down to approximately 225,000 km/s due to water’s refractive index of ~1.33.'
  },
  {
    category: 'Math',
    question: 'Who is known as the "Man Who Knew Infinity"?',
    options: ['Aryabhata', 'Srinivasa Ramanujan', 'C. V. Raman', 'Euclid'],
    correct: 1,
    funFact: 'Srinivasa Ramanujan made monumental contributions to mathematical analysis, infinite series, and continued fractions.'
  },
  {
    category: 'Chemistry',
    question: 'What gas makes up approximately 78% of Earth\'s atmosphere?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
    correct: 2,
    funFact: 'Nitrogen gas (N₂) constitutes roughly 78.08% of Earth\'s dry atmosphere, with Oxygen making up about 20.95%.'
  }
];

export const LoadingView: React.FC<LoadingViewProps> = ({ config, onCancel }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Dynamic stages tailored to the exact source
  const isCustomNotes = config.sourceType === 'notes';
  const isCustomPDF = config.sourceType === 'pdf';
  const isCustomWeb = config.sourceType === 'webpage';
  const isCustomText = config.sourceType === 'text';
  const isCustomSource = isCustomNotes || isCustomPDF || isCustomWeb || isCustomText;

  let stages: string[] = [];
  if (isCustomNotes) {
    stages = [
      'Scanning handwritten notes via multimodal Neural Vision...',
      'Recognizing student handwriting & formatting math LaTeX...',
      `Synthesizing ${config.quantity} custom assessment items from your notes...`,
      `Calibrating ${config.strength} cognitive depth & rationale alignment...`,
      'Finalizing step-by-step solutions & verification...',
    ];
  } else if (isCustomPDF) {
    stages = [
      'Parsing PDF document structure & semantic hierarchy...',
      'Extracting core definitions, formulas, and textbook sections...',
      `Generating ${config.quantity} items from document text...`,
      `Calibrating ${config.strength} difficulty & rationale checks...`,
      'Finalizing questions and response schema...',
    ];
  } else if (isCustomWeb) {
    stages = [
      `Analyzing webpage contents from [${(config.sourceTitle || 'Web Source').slice(0, 30)}]...`,
      'Extracting academic definitions, concepts, and factual details...',
      `Formulating ${config.quantity} syllabus-aligned assessment items...`,
      `Calibrating ${config.strength} cognitive demand...`,
      'Finalizing step-by-step pedagogical rationales...',
    ];
  } else if (isCustomText) {
    stages = [
      'Parsing custom study text & topic outlines...',
      'Synthesizing key definitions, relationships, and problem statements...',
      `Drafting ${config.quantity} questions from custom content...`,
      `Calibrating ${config.strength} cognitive level...`,
      'Finalizing verification & formatting...',
    ];
  } else {
    stages = [
      'Connecting to NCERT Unified Knowledge Matrix...',
      `Scanning ${config.class || 'NCERT'} • ${config.subject || 'Curriculum'} Syllabus...`,
      `Synthesizing ${config.quantity || 10} items for [${(config.topics || []).slice(0, 2).join(', ')}${(config.topics || []).length > 2 ? ` +${(config.topics || []).length - 2} more` : ''}]...`,
      `Calibrating ${config.strength || 'Medium'} Cognitive Demand & Rationales...`,
      'Finalizing Mathematical Formulas & Response Verification...',
    ];
  }

  const [stage, setStage] = useState(0);

  // Boredom Buster Trivia Mini-Game State
  const [currentTriviaIdx, setCurrentTriviaIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaAnswered, setTriviaAnswered] = useState(false);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setStage(s => (s < stages.length - 1 ? s + 1 : s));
    }, 2800);

    const timer = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);

    return () => {
      clearInterval(stageTimer);
      clearInterval(timer);
    };
  }, [stages.length]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectTriviaOption = (idx: number) => {
    if (triviaAnswered) return;
    setSelectedOption(idx);
    setTriviaAnswered(true);
    if (idx === TRIVIA_QUESTIONS[currentTriviaIdx].correct) {
      setTriviaScore(sc => sc + 1);
    }
  };

  const handleNextTrivia = () => {
    setSelectedOption(null);
    setTriviaAnswered(false);
    setCurrentTriviaIdx(i => (i + 1) % TRIVIA_QUESTIONS.length);
  };

  const currentTrivia = TRIVIA_QUESTIONS[currentTriviaIdx];

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Top Progress & Animation Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Pulsing Visual Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping opacity-30" />
              <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin" />
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Atom className="w-7 h-7 text-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Status Information */}
            <div className="text-center sm:text-left flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
                  {isCustomNotes ? 'Transcribing & Drafting Quiz' : isCustomPDF ? 'Analyzing Document & Generating' : isCustomWeb ? 'Synthesizing Webpage Quiz' : 'Drafting NCERT Assessment'}
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>{formatElapsed(elapsedSeconds)}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-mono text-emerald-400 font-semibold min-h-[22px]">
                {stages[stage]}
              </p>

              {/* Source & Custom Instructions Badge */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {isCustomSource && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium">
                    {isCustomNotes ? <FileText className="w-3 h-3" /> : isCustomWeb ? <Globe className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    <span>Source: {config.sourceTitle || (config.sourceType || 'custom').toUpperCase()}</span>
                  </span>
                )}
                {config.customInstructions && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-medium">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Custom Guidance Active</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Checkpoints */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-1.5">
            {stages.map((stgText, idx) => {
              const isDone = idx < stage;
              const isCurrent = idx === stage;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 text-xs py-0.5 transition-all ${
                    isDone ? 'text-emerald-400 font-medium' : isCurrent ? 'text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-800 shrink-0" />
                  )}
                  <span className="truncate">{stgText}</span>
                </div>
              );
            })}
          </div>

          {elapsedSeconds > 14 && (
            <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs text-amber-300/90 font-mono flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span>Synthesizing deep conceptual options & LaTeX formulas. Play the brain teaser below while waiting!</span>
            </div>
          )}
        </div>

        {/* BOREDOM BUSTER: Interactive Academic Trivia Mini-Game */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Brain Teaser Warm-up</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                    {currentTrivia.category}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Keep your mind sharp while AI models draft your exam!</p>
              </div>
            </div>

            {/* Score & Refresh */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-emerald-300">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Score: {triviaScore}</span>
              </div>
              <button
                type="button"
                onClick={handleNextTrivia}
                title="Next Brain Teaser"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-4">
            <p className="text-sm sm:text-base font-semibold text-slate-100">
              {currentTrivia.question}
            </p>
          </div>

          {/* 4 Interactive Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            {currentTrivia.options.map((optionText, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentTrivia.correct;
              let btnStyle = "bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200";

              if (triviaAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
                } else {
                  btnStyle = "opacity-50 border-slate-800 text-slate-400";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTriviaOption(idx)}
                  disabled={triviaAnswered}
                  className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-2 active:scale-98 ${btnStyle}`}
                >
                  <span>{optionText}</span>
                  {triviaAnswered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {triviaAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation & Next Question Button */}
          {triviaAnswered && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-400">Did you know? </span>
                  <span>{currentTrivia.funFact}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNextTrivia}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-md"
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Cancel Generation Option */}
        <div className="text-center">
          <button
            type="button"
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
