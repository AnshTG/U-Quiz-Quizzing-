import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CalendarCheck, 
  Trophy, 
  X, 
  CheckCircle2, 
  Layers, 
  Flame, 
  QrCode, 
  GraduationCap,
  Lightbulb,
  Award,
  HelpCircle,
  Clock,
  Compass,
  Zap,
  MessageSquare,
  Check,
  Bookmark,
  Share2,
  Brain,
  AlertTriangle,
  Bug,
  Search,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  ShieldAlert,
  WifiOff,
  Filter
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

type DocSection = 'overview' | 'curriculum' | 'quizzes' | 'attendance' | 'vault_challenges' | 'faqs' | 'errors';

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<DocSection>('overview');
  const [faqFilter, setFaqFilter] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [errorSearchQuery, setErrorSearchQuery] = useState<string>('');
  const [errorCategoryFilter, setErrorCategoryFilter] = useState<string>('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display text-white truncate">
                  U-Quiz Student & Educator Guide
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
                  Complete Handbook
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Everything you need to master NCERT subjects, build daily study streaks, and challenge friends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-950/60 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'overview'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Getting Started</span>
          </button>

          <button
            onClick={() => setActiveSection('curriculum')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'curriculum'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. NCERT Syllabus (Classes 1–12)</span>
          </button>

          <button
            onClick={() => setActiveSection('quizzes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'quizzes'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. Taking Quizzes & Explanations</span>
          </button>

          <button
            onClick={() => setActiveSection('attendance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'attendance'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>4. Daily Attendance & Streaks</span>
          </button>

          <button
            onClick={() => setActiveSection('vault_challenges')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'vault_challenges'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>5. Saved Vault & Challenge Codes</span>
          </button>

          <button
            onClick={() => setActiveSection('faqs')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'faqs'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>6. Comprehensive FAQs</span>
          </button>

          <button
            onClick={() => setActiveSection('errors')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'errors'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>7. Error Catalog & Troubleshooting</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 text-slate-300 text-sm leading-relaxed">
          
          {/* ================= CHAPTER 1: GETTING STARTED ================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-950 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                    Chapter 1
                  </span>
                  <span className="text-xs text-slate-400">• Student & Parent Orientation</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Welcome to U-Quiz: Your NCERT Learning Companion
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">U-Quiz</strong> is an interactive learning and self-assessment platform crafted specifically for Indian school students from <strong className="text-emerald-400">Class 1 through Class 12</strong>. Whether you are preparing for periodic school tests, CBSE Board Exams, Olympiads, or foundational competitive exams (like NEET and JEE), U-Quiz gives you unlimited practice questions, instant step-by-step textbook explanations, and daily revision tracking.
                </p>
              </div>

              {/* 3 Step Quick Start Guide */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>How to Start Practicing in 3 Simple Steps</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h5 className="text-sm font-bold text-white">Select Class & Subject</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Choose your grade (Class 1 to 12) and subject from the Home dashboard or Curriculum directory. You can pick specific NCERT chapters or create an all-chapter mix.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h5 className="text-sm font-bold text-white">Customize Quiz Settings</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pick how many questions you want (5, 10, 15, or 20) and select your target strength level: <span className="text-emerald-400 font-semibold">Foundational</span>, <span className="text-amber-400 font-semibold">Standard</span>, or <span className="text-rose-400 font-semibold">Exemplar</span>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h5 className="text-sm font-bold text-white">Solve & Learn</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Answer with immediate feedback or standard exam mode. Review step-by-step textbook solutions for every single question to master the underlying concepts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest vs Sign In Benefits */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Guest Mode vs. Creating a Free Scholar Account</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Guest Mode (No Sign-In Required)</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      You can instantly generate and practice unlimited quizzes right away. Your quiz scores and attendance for the current browser session are saved on your device.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Signed-In Scholar Account (Recommended)</span>
                    </div>
                    <ul className="space-y-1 text-slate-300">
                      <li>• Saves up to 50 custom quizzes in your personal Vault</li>
                      <li>• Synchronizes your daily study streak across phones, tablets & laptops</li>
                      <li>• Features your name on the Global Scholar Leaderboard</li>
                      <li>• Allows bookmarking difficult questions for pre-exam revision</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Effective Study Tips */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Pro Tips for Daily Study Success</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong className="text-slate-200">Daily 10-Minute Habit:</strong> Taking just one 5 or 10-question quiz every day reinforces memory retention by over 80% compared to last-minute cramming.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong className="text-slate-200">Review Before Moving On:</strong> Always read the step-by-step solution for any question you answered incorrectly to understand the formula or concept.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong className="text-slate-200">Progressive Challenge:</strong> Start with <strong className="text-emerald-400">Foundational</strong> when learning a new chapter, then advance to <strong className="text-amber-400">Standard</strong> and <strong className="text-rose-400">Exemplar</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong className="text-slate-200">Challenge Study Groups:</strong> Share 6-digit challenge codes with your classmates to make revision fun and collaborative.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ================= CHAPTER 2: NCERT CURRICULUM ================= */}
          {activeSection === 'curriculum' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-950 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                    Chapter 2
                  </span>
                  <span className="text-xs text-slate-400">• Comprehensive Syllabus Breakdown</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Complete NCERT Curriculum Coverage (Classes 1 to 12)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Every quiz subject, chapter, and question is mapped directly to the official NCERT textbook guidelines and CBSE curriculum frameworks. This guarantees that every minute you spend on U-Quiz directly supports your school syllabus and board examinations.
                </p>
              </div>

              {/* Grade Band Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Grade Bands & Subject Specialization</h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        <th className="p-3.5">School Wing</th>
                        <th className="p-3.5">Grades</th>
                        <th className="p-3.5">Key Subjects Covered</th>
                        <th className="p-3.5">Learning & Exam Focus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="p-3.5 font-bold text-emerald-400">Primary Wing</td>
                        <td className="p-3.5 font-mono">Classes 1, 2, 3, 4, 5</td>
                        <td className="p-3.5">Mathematics, Environmental Studies (EVS), English, Hindi</td>
                        <td className="p-3.5 text-slate-400">Visual problem solving, everyday arithmetic, nature appreciation, vocabulary and sentence building.</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-bold text-teal-400">Middle School</td>
                        <td className="p-3.5 font-mono">Classes 6, 7, 8</td>
                        <td className="p-3.5">Science, Mathematics, Social Science (History, Civics, Geography), Sanskrit</td>
                        <td className="p-3.5 text-slate-400">Foundational scientific experiments, basic algebraic equations, geometric constructions, and historical timelines.</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-bold text-cyan-400">Secondary Wing</td>
                        <td className="p-3.5 font-mono">Classes 9, 10</td>
                        <td className="p-3.5">Science (Physics, Chemistry, Biology), Mathematics, Social Science (Economics, Civics, History, Geography)</td>
                        <td className="p-3.5 text-slate-400">CBSE 10th Board Exam pattern questions, assertion-reasoning, case-based questions, and numerical derivations.</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-bold text-purple-400">Senior Secondary</td>
                        <td className="p-3.5 font-mono">Classes 11, 12</td>
                        <td className="p-3.5">Physics, Chemistry, Biology, Mathematics, Economics, History, Geography</td>
                        <td className="p-3.5 text-slate-400">NCERT Exemplar problems, CBSE 12th Board Exam preparation, and foundational concepts for NEET & JEE Main.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Three Challenge Levels Explained */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Three Quiz Challenge Levels</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Foundational
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Level 1</span>
                    </div>
                    <h5 className="text-sm font-bold text-white pt-1">Core Concepts & Definitions</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ideal for when you are starting a chapter. Tests direct textbook definitions, key terms, formula recognition, and fundamental facts.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        Standard
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Level 2</span>
                    </div>
                    <h5 className="text-sm font-bold text-white pt-1">Application & Calculations</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Standard school exam level. Involves solving numerical problems, applying multi-step reasoning, and connecting related concepts across chapters.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        Exemplar
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Level 3</span>
                    </div>
                    <h5 className="text-sm font-bold text-white pt-1">Higher-Order Thinking</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Based on NCERT Exemplar books, Olympiad questions, and competitive exam foundations. Features complex multi-concept challenges and assertion-reasoning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= CHAPTER 3: TAKING QUIZZES ================= */}
          {activeSection === 'quizzes' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-950 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                    Chapter 3
                  </span>
                  <span className="text-xs text-slate-400">• Assessment Mastery & Explanations</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Interactive Quizzes & Step-by-Step Explanations
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Discover how the quiz screen works, how mathematical and scientific formulas are clearly formatted, and how to analyze your results to turn weak areas into strengths.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Smart Question Interface</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong className="text-slate-200">Question Navigation Bar:</strong> Easily jump between questions, check which ones you have answered, and track remaining time.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong className="text-slate-200">Instant Solution Mode:</strong> When enabled, you immediately see the explanation after selecting an answer, perfect for self-study and learning.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong className="text-slate-200">Exam Mode:</strong> Simulates a real timed test where explanations and total scores are revealed upon final submission.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-teal-400" />
                    <span>Clear Math & Science Equations</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All complex equations are formatted cleanly on your screen for maximum readability:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">• Fractions, square roots, and powers (e.g. <span className="font-mono text-teal-300">x = (-b ± √(b² - 4ac)) / 2a</span>)</li>
                    <li className="flex items-center gap-2">• Chemical reactions and balanced equations (e.g. <span className="font-mono text-teal-300">2H₂ + O₂ → 2H₂O</span>)</li>
                    <li className="flex items-center gap-2">• Physics units, vectors, and trigonometric identities</li>
                  </ul>
                </div>
              </div>

              {/* Scorecard & Review Explanation */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Understanding Your Scorecard & Performance Analytics</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-emerald-400">Accuracy & Percentage</span>
                    <p className="text-[11px] text-slate-400">See your overall score, percentage rank, and accuracy rating out of total attempted questions.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-teal-400">Pace & Time Spent</span>
                    <p className="text-[11px] text-slate-400">Review total time taken and average seconds spent per question to optimize your speed for school exams.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-amber-400">Chapter Retake & Save</span>
                    <p className="text-[11px] text-slate-400">Save the quiz directly into your Cloud Vault or instantly retake it to achieve a 100% perfect score.</p>
                  </div>
                </div>
              </div>

              {/* Study Chat Mentorship */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-slate-950 to-slate-950 border border-purple-500/20 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>Study Chat & AI NCERT Doubt Mentor</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Stuck on a tricky homework question or textbook problem? Open the <strong className="text-white">Study Chat</strong> from the top navigation bar, choose your Class and Subject, and ask your question. The AI Study Mentor provides clear, friendly, step-by-step guidance without giving away answers directly, helping you understand the concept deeply.
                </p>
              </div>
            </div>
          )}

          {/* ================= CHAPTER 4: AUTOMATIC ATTENDANCE ================= */}
          {activeSection === 'attendance' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-slate-950 border border-teal-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-mono text-xs font-bold uppercase tracking-wider">
                    Chapter 4
                  </span>
                  <span className="text-xs text-slate-400">• Habit Building & Streak Tracking</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Automatic Daily Attendance & Study Streaks
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Building consistent daily study habits is the key to academic excellence. U-Quiz automatically tracks your attendance and maintains your active revision streak without requiring any manual check-in clicks.
                </p>
              </div>

              {/* 3 Pillars of Automated Attendance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-white">Daily Login Check-In</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Whenever you open U-Quiz and sign in during the day, your daily study session is automatically recognized and recorded in Indian Standard Time (IST).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-white">Quiz Completion Log</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Completing any assessment automatically updates your study log with the subject practiced, score achieved, and questions answered.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-white">Active Streak Flame (🔥)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Practicing on consecutive calendar days grows your Streak Flame (<span className="text-orange-400 font-bold">🔥 5d Streak</span>), visible on your profile and leaderboards.
                  </p>
                </div>
              </div>

              {/* Attendance Details */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-teal-400" />
                  <span>How the Attendance Calendar Works</span>
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Indian Standard Time (IST) Reset:</strong> A new attendance day begins at 12:00 AM midnight IST. Whether you practice in the morning or evening, your study day is accurately counted.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Zero-Click Convenience:</strong> You never have to search for a "Mark Present" button. The moment you start learning, your attendance is safely logged.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Attendance History Inspection:</strong> Click the Calendar / Streak icon in the top navigation bar at any time to view your full history of active study days and total quizzes completed.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ================= CHAPTER 5: VAULT, CHALLENGES & LEADERBOARD ================= */}
          {activeSection === 'vault_challenges' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-emerald-500/10 to-slate-950 border border-purple-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                    Chapter 5
                  </span>
                  <span className="text-xs text-slate-400">• Social Learning & Revision Vault</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Quiz Vault, Challenge Codes & Global Leaderboard
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Explore how to build your personal library of saved practice tests, challenge your classmates with 6-digit codes, and climb the ranks from NCERT Novice to Grandmaster Scholar.
                </p>
              </div>

              {/* 3 Main Sections */}
              <div className="space-y-4">
                
                {/* Cloud Vault */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Cloud Quiz Vault (Save Up to 50 Quizzes)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    When you generate a great quiz or want to save a tricky question set for final exam revision, click <strong className="text-purple-300">"Save to Vault"</strong>. Your saved quizzes retain all questions, options, and full step-by-step solutions. You can access them anytime from the <strong className="text-white">"Quiz Vault"</strong> navigation tab to retake them or review answers.
                  </p>
                </div>

                {/* 6-Digit Challenge Codes */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      6-Digit Challenge Codes & Group Study
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Turn revision into a friendly competition! From your Quiz Results or Vault, click <strong className="text-emerald-300">"Share Challenge"</strong> to generate a unique 6-digit code (e.g. <span className="font-mono text-emerald-400 font-bold">842910</span>) or direct link.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <strong className="text-white block">How your friends join:</strong>
                    <span>Classmates simply click <strong className="text-emerald-400">"Join Code"</strong> in the top navigation bar, enter your 6-digit code, and take the exact same test to compare scores.</span>
                  </div>
                </div>

                {/* Scholar Leaderboard & Ranks */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Global Scholar Leaderboard & Academic Ranks
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Earn Scholar Points by answering questions correctly, finishing assessments, and keeping your daily study streak active. Climb through prestigious scholar tiers:
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-mono">Tier 1</span>
                      <strong className="text-emerald-400 text-xs">NCERT Novice</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-mono">Tier 2</span>
                      <strong className="text-teal-400 text-xs">Concept Builder</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-mono">Tier 3</span>
                      <strong className="text-purple-400 text-xs">Master Scholar</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block font-mono">Tier 4</span>
                      <strong className="text-amber-400 text-xs">Grandmaster</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= CHAPTER 6: FAQS & STUDY TIPS ================= */}
          {activeSection === 'faqs' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-950 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                    Chapter 6
                  </span>
                  <span className="text-xs text-slate-400">• Frequently Asked Questions</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Everything You Need to Know About U-Quiz
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Browse quick answers to frequently asked questions about syllabus coverage, custom note quizzes, mathematical notation, attendance streaks, and sharing challenge codes.
                </p>

                {/* FAQ Category Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {[
                    { id: 'all', label: 'All Topics' },
                    { id: 'curriculum', label: 'Curriculum & Books' },
                    { id: 'custom', label: 'Custom Notes & PDF' },
                    { id: 'streaks', label: 'Streaks & Attendance' },
                    { id: 'sharing', label: 'Challenges & QR' },
                    { id: 'tech', label: 'Math & Tech' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setFaqFilter(tab.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        faqFilter === tab.id
                          ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-3">
                {[
                  {
                    id: 'faq-1',
                    category: 'curriculum',
                    question: 'Is the question bank strictly mapped to official NCERT textbooks?',
                    answer: 'Yes. Every assessment is grounded directly in official NCERT textbooks from Class 1 through Class 12, reflecting the latest 2026-27 rationalized textbook editions. Terminology, scientific notations, chapter classifications, and sample questions align with CBSE examination blueprints.'
                  },
                  {
                    id: 'faq-2',
                    category: 'custom',
                    question: 'How do I generate a quiz from my own coaching notes or textbook PDFs?',
                    answer: 'Click "Quiz from Notes & PDF" or navigate to New Quiz and switch the mode to "Custom Source". You can paste typed or copied revision notes directly, or drag and drop a PDF or picture of a textbook page (up to 10MB). Our multimodal vision engine reads the text and formulas to create bespoke questions targeting your exact notes.'
                  },
                  {
                    id: 'faq-3',
                    category: 'tech',
                    question: 'Why do formulas, fractions, and chemical reactions look so clean?',
                    answer: 'U-Quiz integrates KaTeX, the premier high-performance mathematical typesetting library. Formulas, superscripts, subscripts, fractions, algebraic equations, calculus integrals, and balanced chemical reactions are rendered dynamically with typographic clarity across desktop and mobile devices.'
                  },
                  {
                    id: 'faq-4',
                    category: 'curriculum',
                    question: 'What are the three difficulty levels: Foundational, Standard, and Exemplar?',
                    answer: 'Foundational (Level 1) focuses on direct factual recall, definitions, and basic formula identification. Standard (Level 2) represents standard school term exam questions requiring multi-step numerical calculation and concept application. Exemplar (Level 3) is based on NCERT Exemplar problems, featuring higher-order thinking (HOTS), assertion-reasoning, and Olympiad/foundation level problems.'
                  },
                  {
                    id: 'faq-5',
                    category: 'streaks',
                    question: 'How does daily attendance and study streak tracking work?',
                    answer: 'Attendance is automatically marked as "Present" the moment you begin taking a quiz or revision test. Daily streaks follow Indian Standard Time (IST, UTC+5:30) with midnight (12:00 AM) cutoff. Practicing on consecutive calendar days increments your Streak Flame (🔥). Multiple quizzes taken on the same day add to your total score and XP, but advance your streak once per day.'
                  },
                  {
                    id: 'faq-6',
                    category: 'sharing',
                    question: 'How do I challenge my friends or students with a 6-digit code or QR code?',
                    answer: 'After completing any quiz or opening a test in your Quiz Vault, click "Share Challenge". U-Quiz generates a unique 6-digit code (e.g. 748291) and a downloadable QR code. Your classmates can simply click "Join Code" in the top bar or scan the QR code to take the exact same test and compare their score against yours.'
                  },
                  {
                    id: 'faq-7',
                    category: 'custom',
                    question: 'Can I upload pictures of handwritten notes or diagrams?',
                    answer: 'Yes! You can upload clear, legible photos (PNG, JPEG, WebP) of handwritten notes or printed classroom handouts. For best results, ensure the photo is well-lit and oriented upright. If handwriting is difficult to read, you can also copy and paste the text directly into the "Paste Notes" tab.'
                  },
                  {
                    id: 'faq-8',
                    category: 'curriculum',
                    question: 'Can I select multiple chapters or create an all-chapter mock exam?',
                    answer: 'Yes! In the Custom Quiz Configurator, you can toggle between selecting individual chapters (multi-select any combination you want) or checking "Select All Chapters" to generate a full-length cumulative term examination.'
                  },
                  {
                    id: 'faq-9',
                    category: 'tech',
                    question: 'Will I lose my progress if my internet connection briefly drops?',
                    answer: 'No! Once a quiz has loaded into your browser, all questions, timer controls, and option selections operate fully in client memory. You can complete your test uninterrupted. When your connection reconnects, your results and attendance will automatically sync to your cloud profile.'
                  },
                  {
                    id: 'faq-10',
                    category: 'sharing',
                    question: 'How many quizzes can I save in my Cloud Quiz Vault?',
                    answer: 'Every scholar account can store up to 50 complete quizzes in their Cloud Vault, including all questions, correct answers, and in-depth textbook explanations. You can revisit, retake, or generate fresh challenge codes from your Vault anytime.'
                  }
                ]
                  .filter(faq => faqFilter === 'all' || faq.category === faqFilter)
                  .map(faq => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center shrink-0">
                              Q
                            </span>
                            <span className="text-sm font-bold text-white leading-snug">
                              {faq.question}
                            </span>
                          </div>
                          <div className="p-1 rounded-lg bg-slate-900 text-slate-400 shrink-0">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-900 bg-slate-900/30">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ================= CHAPTER 7: ERROR CATALOG & TROUBLESHOOTING ================= */}
          {activeSection === 'errors' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-slate-950 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                    Chapter 7
                  </span>
                  <span className="text-xs text-slate-400">• Technical Diagnostics & Solutions</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Error Code Directory & Instant Troubleshooting
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Encountered an issue while uploading notes, taking an exam, or joining a challenge code? Search our error database below to find the exact root cause and step-by-step resolution.
                </p>

                {/* Search & Category Filter Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={errorSearchQuery}
                      onChange={(e) => setErrorSearchQuery(e.target.value)}
                      placeholder="Search error code (e.g. ERR_EMPTY_FILE, 10MB, QR, Streak)..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    {[
                      { id: 'all', label: 'All Errors' },
                      { id: 'upload', label: 'Upload & OCR' },
                      { id: 'network', label: 'Network & Cloud' },
                      { id: 'challenge', label: 'Challenge Codes' },
                      { id: 'auth', label: 'Auth & Streaks' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setErrorCategoryFilter(cat.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          errorCategoryFilter === cat.id
                            ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Cards Grid */}
              <div className="space-y-4">
                {[
                  {
                    code: 'ERR_EMPTY_FILE',
                    category: 'upload',
                    severity: 'High',
                    title: 'Empty File or Non-Text Scan Detected',
                    symptom: 'Upload fails immediately with "Uploaded file appears to be empty or corrupted".',
                    rootCause: 'The selected PDF contains 0 readable pages, is password protected, or is a 0-byte file.',
                    solution: [
                      'Verify that the PDF opens normally in your browser or Adobe Reader.',
                      'If the PDF is password-protected, remove the password before uploading.',
                      'If the file is an unsearchable photocopy, switch to the "Paste Notes" tab and paste the text directly.'
                    ]
                  },
                  {
                    code: 'ERR_FILE_TOO_LARGE',
                    category: 'upload',
                    severity: 'Medium',
                    title: 'File Size Exceeds 10MB Limit',
                    symptom: 'Upload dialog rejects file with "File size exceeds 10MB limit".',
                    rootCause: 'High-resolution full-book scans often exceed the 10MB browser memory threshold.',
                    solution: [
                      'Extract only the specific chapter pages (1 to 10 pages) rather than the whole 300-page textbook.',
                      'Compress the PDF using any free PDF compressor tool before uploading.',
                      'Alternatively, take a clear photo of just the chapter summary pages.'
                    ]
                  },
                  {
                    code: 'ERR_UNSUPPORTED_FORMAT',
                    category: 'upload',
                    severity: 'Medium',
                    title: 'Unsupported File Extension',
                    symptom: 'Upload error: "Unsupported file type. Please upload PDF, PNG, JPG, or WebP".',
                    rootCause: 'Uploaded file is a Word document (.docx), PowerPoint (.pptx), rich text (.rtf), or compressed archive (.zip).',
                    solution: [
                      'Export or Save As PDF from Microsoft Word or Google Docs before uploading.',
                      'Or copy all text from the document and paste directly into the "Paste Notes" tab.'
                    ]
                  },
                  {
                    code: 'ERR_CHALLENGE_NOT_FOUND',
                    category: 'challenge',
                    severity: 'Medium',
                    title: 'Invalid or Expired Challenge Code',
                    symptom: 'Joining with a 6-digit code displays "Challenge not found or has expired".',
                    rootCause: 'The 6-digit code was mistyped, or the creator has deleted the quiz from their Vault.',
                    solution: [
                      'Check the 6 digits carefully (e.g. ensure 0 is not typed as letter O, or 1 as letter l).',
                      'Ask the host/educator to open their Quiz Vault and verify the active 6-digit code.',
                      'Scan the host\'s shared QR code directly using your mobile phone camera for instant joining.'
                    ]
                  },
                  {
                    code: 'ERR_GEMINI_RATE_LIMIT',
                    category: 'network',
                    severity: 'Medium',
                    title: 'AI Assessment Generator Busy',
                    symptom: 'Generation pauses or displays "AI generator is busy. Retrying in a few seconds...".',
                    rootCause: 'Burst rate limits on the backend Gemini model during peak revision hours (e.g. evenings before board exams).',
                    solution: [
                      'Wait 5 to 10 seconds; the system includes built-in exponential backoff and will usually succeed on automatic retry.',
                      'Try selecting 10 or 15 questions instead of 50 questions for faster multi-token completion.'
                    ]
                  },
                  {
                    code: 'ERR_NETWORK_OFFLINE',
                    category: 'network',
                    severity: 'High',
                    title: 'Network Disconnected During Quiz',
                    symptom: 'Internet icon displays offline indicator or toast shows "Connection lost".',
                    rootCause: 'Local Wi-Fi or mobile data drop.',
                    solution: [
                      'DO NOT CLOSE OR REFRESH YOUR BROWSER TAB! The current quiz is entirely preserved in browser memory.',
                      'Continue answering all questions normally.',
                      'When your device reconnects to Wi-Fi/4G/5G, click "Submit Assessment" to automatically sync results.'
                    ]
                  },
                  {
                    code: 'ERR_AUTH_POPUP_BLOCKED',
                    category: 'auth',
                    severity: 'Medium',
                    title: 'Google Sign-In Popup Blocked',
                    symptom: 'Clicking "Sign In with Google" produces no popup window or flashes briefly.',
                    rootCause: 'Browser popup blocker, incognito mode third-party cookie restrictions, or iframe sandbox policy.',
                    solution: [
                      'Look at your browser URL bar for a "Pop-up blocked" icon and click "Always allow popups for this site".',
                      'If viewing inside an embedded preview iframe, click the "Open in new window" button at the top right.',
                      'Ensure third-party cookies are not strictly blocked for accounts.google.com.'
                    ]
                  },
                  {
                    code: 'ERR_STREAK_DESYNC_TIMEZONE',
                    category: 'auth',
                    severity: 'Low',
                    title: 'Streak Flame (🔥) Not Increasing on Same Day',
                    symptom: 'Taking a 2nd or 3rd test today does not increase the streak number.',
                    rootCause: 'Streaks only advance once per calendar day (12:00 AM Midnight IST cutoff).',
                    solution: [
                      'This is expected behavior! Multiple tests taken on the same calendar day reinforce your mastery and add Scholar Points to the Leaderboard.',
                      'To advance your streak from e.g. 5 days to 6 days, take your next quiz on the following calendar day.'
                    ]
                  },
                  {
                    code: 'ERR_KATEX_RENDER_FALLBACK',
                    category: 'network',
                    severity: 'Low',
                    title: 'Mathematical Formula Displaying as Raw Code',
                    symptom: 'An equation appears as raw LaTeX text (e.g. \\frac{a}{b}) rather than formatted graphics.',
                    rootCause: 'Unescaped backslashes in generated questions or complex non-standard chemical structures.',
                    solution: [
                      'U-Quiz features an automatic fail-safe parser: if KaTeX encounters an unrecognized macro, it immediately displays the readable unicode equivalent.',
                      'The question remains 100% solvable without any missing terms.'
                    ]
                  },
                  {
                    code: 'ERR_BLANK_NOTES_INPUT',
                    category: 'upload',
                    severity: 'Medium',
                    title: 'Blank or Insufficient Notes Input',
                    symptom: 'Generator reports "Please provide at least 20 words of notes to generate a quiz".',
                    rootCause: 'The input textbox contained only a few words, which is insufficient for AI to formulate multi-question exams.',
                    solution: [
                      'Provide at least 2-3 paragraphs or 50+ words of textbook notes, summaries, or key formulas.',
                      'Include key terms, definitions, and concepts you want to be tested on.'
                    ]
                  }
                ]
                  .filter(err => {
                    const matchesCat = errorCategoryFilter === 'all' || err.category === errorCategoryFilter;
                    const query = errorSearchQuery.trim().toLowerCase();
                    if (!query) return matchesCat;
                    const matchesSearch = 
                      err.code.toLowerCase().includes(query) ||
                      err.title.toLowerCase().includes(query) ||
                      err.symptom.toLowerCase().includes(query) ||
                      err.rootCause.toLowerCase().includes(query) ||
                      err.solution.some(s => s.toLowerCase().includes(query));
                    return matchesCat && matchesSearch;
                  })
                  .map(err => (
                    <div
                      key={err.code}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl flex items-center justify-center ${
                            err.severity === 'High'
                              ? 'bg-rose-500/20 text-rose-400'
                              : err.severity === 'Medium'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-teal-500/20 text-teal-400'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white">
                                {err.code}
                              </span>
                              <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                err.severity === 'High'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : err.severity === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                              }`}>
                                {err.severity} Impact
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-100">
                              {err.title}
                            </h4>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 capitalize">
                          {err.category}
                        </span>
                      </div>

                      {/* Symptom & Cause */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1">
                          <strong className="text-rose-400 block font-semibold">Observed Symptom:</strong>
                          <p className="text-slate-300 leading-relaxed">{err.symptom}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1">
                          <strong className="text-amber-400 block font-semibold">Underlying Root Cause:</strong>
                          <p className="text-slate-300 leading-relaxed">{err.rootCause}</p>
                        </div>
                      </div>

                      {/* Solutions */}
                      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5 text-xs">
                        <strong className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Recommended Resolution Steps:</span>
                        </strong>
                        <ul className="space-y-1 text-slate-300 pl-5 list-disc">
                          {err.solution.map((step, sIdx) => (
                            <li key={sIdx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>U-Quiz Student Guide • Ready for Learning</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
          >
            Start Practicing
          </button>
        </div>

      </div>
    </div>
  );
};
