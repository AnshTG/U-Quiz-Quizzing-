import React, { useEffect, useState } from 'react';
import { SharedQuiz, QuizConfig, Question } from '../types';
import { fetchSharedQuiz, incrementQuizPlays } from '../services/firebase';
import { 
  Play, 
  Sparkles, 
  Users, 
  Award, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Flame,
  Calendar
} from 'lucide-react';

interface SharedPreviewViewProps {
  quizId: string;
  onPlayQuiz: (config: QuizConfig, questions: Question[]) => void;
  onBackHome: () => void;
}

export const SharedPreviewView: React.FC<SharedPreviewViewProps> = ({
  quizId,
  onPlayQuiz,
  onBackHome,
}) => {
  const [quizData, setQuizData] = useState<SharedQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSharedQuiz(quizId);
        if (!data) {
          setError(`We could not find a quiz with ID "${quizId}". The link might be expired or mistyped.`);
        } else {
          setQuizData(data);
        }
      } catch (err: any) {
        console.error('Fetch shared quiz error:', err);
        setError('Failed to load shared quiz. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const handleStart = () => {
    if (!quizData) return;
    incrementQuizPlays(quizId); // Non-blocking play counter increment
    onPlayQuiz(quizData.config, quizData.questions);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white">Loading Shared Assessment...</h2>
        <p className="text-xs text-slate-400">Retrieving challenge questions and curriculum parameters from the cloud</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">Quiz Challenge Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to U Quiz Home</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      
      {/* Top Back Nav */}
      <button
        onClick={onBackHome}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </button>

      {/* Hero Shared Card */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-10 shadow-2xl overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shared NCERT Challenge</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white leading-tight">
            {quizData.title}
          </h1>

          {/* Creator Profile Chip */}
          <div className="flex items-center gap-3 pt-1">
            {quizData.creatorPhoto ? (
              <img
                src={quizData.creatorPhoto}
                alt={quizData.creatorName || 'Creator'}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border border-emerald-400/40 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-sm">
                {quizData.creatorName ? quizData.creatorName.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-white block">
                Created by {quizData.creatorName || 'NCERT Scholar'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {quizData.playsCount || 0} players have taken this challenge
              </span>
            </div>
          </div>
        </div>

        {/* Challenge Attributes Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-left">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Grade Level</span>
            <span className="text-xs font-bold text-white font-display truncate block mt-0.5">
              {quizData.config.class}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Subject</span>
            <span className="text-xs font-bold text-emerald-400 font-display truncate block mt-0.5">
              {quizData.config.subject}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Cognitive Demand</span>
            <span className="text-xs font-bold text-amber-400 font-mono block mt-0.5">
              {quizData.config.strength}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium block">Total Items</span>
            <span className="text-xs font-bold text-cyan-400 font-mono block mt-0.5">
              {quizData.questions.length} Questions
            </span>
          </div>
        </div>

        {/* Topics List */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum Chapters Included:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quizData.config.topics.map((topic, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Play CTA Button */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Play Quiz Challenge Now</span>
          </button>
        </div>

      </div>

    </div>
  );
};
