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
  Brain
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'curriculum' | 'quizzes' | 'attendance' | 'vault_challenges'>('overview');

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
