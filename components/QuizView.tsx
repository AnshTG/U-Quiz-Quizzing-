import React, { useState, useEffect, useCallback } from 'react';
import { QuizConfig, Question } from '../types';
import { MathText } from './MathText';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Grid, 
  X, 
  RotateCcw, 
  Sparkles,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

interface QuizViewProps {
  config: QuizConfig;
  questions: Question[];
  onSubmitQuiz: (userAnswers: (string | null)[], timeSpentSeconds: number) => void;
  onQuitQuiz: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  config,
  questions,
  onSubmitQuiz,
  onQuitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);

  const totalTimeLimitSeconds = (config.timeLimitMinutes || 0) * 60;
  const isTimed = totalTimeLimitSeconds > 0;
  const remainingSeconds = isTimed ? Math.max(0, totalTimeLimitSeconds - secondsElapsed) : 0;

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => {
        if (isTimed && prev + 1 >= totalTimeLimitSeconds) {
          clearInterval(timer);
          // Auto submit when time expires
          onSubmitQuiz(userAnswers, totalTimeLimitSeconds);
          return totalTimeLimitSeconds;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimed, totalTimeLimitSeconds, userAnswers]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const currentAnswer = userAnswers[currentIndex];
  const isFlagged = flaggedQuestions[currentIndex];
  const isMultiple = !!currentQ.isMultiple;

  // Selected options array for current question
  const currentSelectedOptions = React.useMemo(() => {
    if (!currentAnswer) return [];
    if (isMultiple) {
      return currentAnswer.split(' | ').map(s => s.trim()).filter(Boolean);
    }
    return [currentAnswer];
  }, [currentAnswer, isMultiple]);

  const handleSelectOption = (option: string) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      const existing = updated[currentIndex];

      if (isMultiple) {
        let currentList = existing ? existing.split(' | ').map(s => s.trim()).filter(Boolean) : [];
        if (currentList.includes(option)) {
          // Deselect
          currentList = currentList.filter(o => o !== option);
        } else {
          // Select
          currentList = [...currentList, option];
        }
        updated[currentIndex] = currentList.length > 0 ? currentList.join(' | ') : null;
      } else {
        // Single choice: Clicking already selected option deselects it!
        if (existing === option) {
          updated[currentIndex] = null;
        } else {
          updated[currentIndex] = option;
        }
      }
      return updated;
    });
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => {
      const updated = [...prev];
      updated[currentIndex] = !updated[currentIndex];
      return updated;
    });
  };

  // Keyboard shortcut listener (A, B, C, D or 1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitModalOpen || isQuitModalOpen || isNavigatorOpen) return;
      
      const key = e.key.toUpperCase();
      if (['A', '1'].includes(key) && currentQ.options[0]) handleSelectOption(currentQ.options[0]);
      if (['B', '2'].includes(key) && currentQ.options[1]) handleSelectOption(currentQ.options[1]);
      if (['C', '3'].includes(key) && currentQ.options[2]) handleSelectOption(currentQ.options[2]);
      if (['D', '4'].includes(key) && currentQ.options[3]) handleSelectOption(currentQ.options[3]);
      if (key === 'F') handleToggleFlag();
      if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) setCurrentIndex(c => c + 1);
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(c => c - 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, isSubmitModalOpen, isQuitModalOpen, isNavigatorOpen]);

  const answeredCount = userAnswers.filter(a => a !== null).length;
  const flaggedCount = flaggedQuestions.filter(f => f).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Header / Assessment HUD */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Meta badges & Exit Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsQuitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Leave this quiz"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Leave Quiz</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-display text-white">{config.class}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-semibold text-emerald-400">{config.subject}</span>
              <span className="text-slate-600">•</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                config.strength === 'Hard'
                  ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                  : config.strength === 'Medium'
                  ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                  : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
              }`}>
                {config.strength}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Timer and Navigator triggers */}
        <div className="flex items-center gap-3">
          {/* Timer widget */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            isTimed && remainingSeconds < 60
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-slate-200'
          }`}>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isTimed ? formatTime(remainingSeconds) : formatTime(secondsElapsed)}
            </span>
            {isTimed && <span className="text-[10px] text-slate-500">left</span>}
          </div>

          {/* Question Grid Navigator Button */}
          <button
            onClick={() => setIsNavigatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Grid className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Overview</span>
            <span className="text-[11px] font-mono text-emerald-400">
              {answeredCount}/{questions.length}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-400 to-lime-400 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 space-y-8 shadow-2xl relative">
        
        {/* Question Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              Q{currentIndex + 1}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {isMultiple ? 'Multiple Choice (Select all that apply)' : 'Single Choice (Click to select/deselect)'}
            </span>
          </div>

          <button
            onClick={handleToggleFlag}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
              isFlagged
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400' : ''}`} />
            <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>
        </div>

        {/* Question Text with Math rendering */}
        <div className="text-lg sm:text-xl md:text-2xl font-medium text-white leading-relaxed">
          <MathText content={currentQ.question} />
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = currentSelectedOptions.includes(option);
            const letter = optionLetters[optIdx];

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(option)}
                className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-150 flex items-center gap-4 group cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 scale-[1.005]'
                    : 'bg-slate-950/50 hover:bg-slate-900 border-slate-800/80 text-slate-200 hover:border-slate-700'
                }`}
              >
                {/* Option Badge (A/B/C/D) */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                }`}>
                  {letter}
                </div>

                {/* Option Text with Math rendering */}
                <div className="flex-1 text-sm sm:text-base font-normal">
                  <MathText content={option} />
                </div>

                {/* Selection Icon (Checkbox for multiple, radio for single) */}
                <div className={`w-5 h-5 ${isMultiple ? 'rounded-lg' : 'rounded-full'} border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                    : 'border-slate-700 group-hover:border-slate-500'
                }`}>
                  {isSelected && (
                    isMultiple ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-950" />
                    )
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom Action Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-4 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Previous */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(c => c - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        </div>

        {/* Center shortcuts tip */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span>Keys:</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">A-D</span>
          <span>select</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">← →</span>
          <span>nav</span>
        </div>

        {/* Right: Next / Submit */}
        <div className="flex items-center gap-2">
          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex(c => c + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Assessment</span>
            </button>
          )}
        </div>

      </div>

      {/* Question Navigator Drawer / Modal */}
      {isNavigatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold font-display text-white">Questions Palette</h3>
              </div>
              <button 
                onClick={() => setIsNavigatorOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-300">Flagged ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
                <span className="text-slate-300">Unanswered ({questions.length - answeredCount})</span>
              </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto custom-scrollbar p-1">
              {questions.map((_, idx) => {
                const isAns = userAnswers[idx] !== null;
                const isFlg = flaggedQuestions[idx];
                const isCurr = currentIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsNavigatorOpen(false);
                    }}
                    className={`relative py-3 rounded-xl font-mono text-xs font-bold transition-all border ${
                      isCurr
                        ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900'
                        : ''
                    } ${
                      isAns
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : isFlg
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlg && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                {answeredCount} of {questions.length} Answered
              </span>
              <button
                onClick={() => {
                  setIsNavigatorOpen(false);
                  setIsSubmitModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Proceed to Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display text-white">Ready to Finish Assessment?</h3>
              <p className="text-xs text-slate-400">
                Review your response breakdown before final evaluation
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xl font-bold font-display text-emerald-400">{answeredCount}</span>
                <span className="block text-[10px] text-slate-400 font-medium">Answered</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xl font-bold font-display text-amber-400">{flaggedCount}</span>
                <span className="block text-[10px] text-slate-400 font-medium">Flagged</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-xl font-bold font-display text-slate-300">
                  {questions.length - answeredCount}
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">Unanswered</span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>You have {questions.length - answeredCount} unanswered questions remaining.</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  onSubmitQuiz(userAnswers, secondsElapsed);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Quiz Modal */}
      {isQuitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">Quit Active Assessment?</h3>
                <p className="text-xs text-slate-400">Your current progress on this set will not be saved.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsQuitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                Resume Test
              </button>
              <button
                type="button"
                onClick={onQuitQuiz}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors"
              >
                Quit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
