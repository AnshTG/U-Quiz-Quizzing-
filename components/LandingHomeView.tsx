import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  BrainCircuit, 
  Database, 
  Flame, 
  Trophy, 
  MessageSquare, 
  ShieldCheck, 
  Layers, 
  Lock, 
  Compass, 
  Calculator, 
  Atom,
  LogIn
} from 'lucide-react';

interface LandingHomeViewProps {
  onTakeToLogin: () => void;
  onOpenAdminAuth: () => void;
  onOpenDocs?: () => void;
}

export const LandingHomeView: React.FC<LandingHomeViewProps> = ({
  onTakeToLogin,
  onOpenAdminAuth,
  onOpenDocs
}) => {
  const [selectedDivision, setSelectedDivision] = useState<'all' | 'primary' | 'middle' | 'secondary' | 'senior'>('secondary');

  const divisions = [
    { id: 'all', label: 'All Classes (1-12)' },
    { id: 'primary', label: 'Primary (1-5)' },
    { id: 'middle', label: 'Middle (6-8)' },
    { id: 'secondary', label: 'Secondary (9-10)' },
    { id: 'senior', label: 'Sr. Secondary (11-12)' },
  ] as const;

  const curriculumHighlights = {
    primary: [
      { name: 'Class 1 to 5 Foundational Learning', books: 'Maths Mela, Joyful Mathematics, Mridang, Santoor, Veena, Shehnai', focus: 'Basic arithmetic, phonics, environmental curiosity, and sensory recognition.' },
    ],
    middle: [
      { name: 'Class 6 New Curricula (2025-26)', books: 'Curiosity (Science), Ganita Prakash (Maths), Exploring Society (Social Science), Poorvi & Malhar', focus: 'Inquiry-based experimentation, mathematical patterns, physical geography, and language skills.' },
      { name: 'Class 7 & 8 Intermediate STEM', books: 'Science, Mathematics, Our Pasts, Resource and Development', focus: 'Scientific method, algebraic expressions, rational numbers, and constitutional awareness.' }
    ],
    secondary: [
      { name: 'Class 9 Board Foundations', books: 'Science, Mathematics, Democratic Politics, India & Contemporary World I', focus: 'Motion, Gravitation, Matter, Polynomials, Coordinate Geometry, and French & Russian revolutions.' },
      { name: 'Class 10 CBSE Board Sprint', books: 'Science, Mathematics, Contemporary India II, Economics', focus: 'Chemical Reactions, Life Processes, Electricity, Light, Quadratic Equations, Trigonometry, and Statistics.' }
    ],
    senior: [
      { name: 'Class 11 & 12 Physics', books: 'Physics Part I & II (NCERT)', focus: 'Thermodynamics, Waves, Electrostatics, Magnetism, Optics, and Modern Physics.' },
      { name: 'Class 11 & 12 Chemistry', books: 'Chemistry Part I & II (NCERT)', focus: 'Atomic Structure, Chemical Bonding, Equilibrium, Organic Synthesis, and Biomolecules.' },
      { name: 'Class 11 & 12 Mathematics & Biology', books: 'Mathematics, Biology (NCERT)', focus: 'Calculus, Vectors, Probability, Genetics, Ecology, and Human Physiology.' }
    ]
  };

  const activeCurriculum = selectedDivision === 'all' 
    ? [...curriculumHighlights.secondary, ...curriculumHighlights.middle, ...curriculumHighlights.senior, ...curriculumHighlights.primary]
    : curriculumHighlights[selectedDivision];

  return (
    <div className="min-h-screen space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900/95 via-slate-900/70 to-slate-950 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official NCERT Curriculum • Classes 1 to 12</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-[1.15]">
            Master every concept with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">NCERT AI Quizzing</span>
          </h1>

          {/* Comprehensive App Description */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            <strong className="text-white font-semibold">U-Quiz</strong> is an intelligent academic quizzing and concept-mastery platform built specifically for CBSE students. Powered by Google Gemini AI, it generates syllabus-grounded assessments with step-by-step textbook explanations, KaTeX mathematical typesetting, an interactive 24/7 Study Chat AI Tutor, and a 50-quiz Cloud Vault.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={onTakeToLogin}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all group cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-slate-950" />
              <span>Get Started & Sign In</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#app-features"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Explore App Features</span>
            </a>

            {onOpenDocs && (
              <button
                onClick={onOpenDocs}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-teal-400" />
                <span>Student Guide</span>
              </button>
            )}
          </div>

          {/* Key Trust Highlights */}
          <div className="pt-4 flex flex-wrap gap-6 text-xs text-slate-400 font-medium border-t border-slate-800/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% NCERT Grounded</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>KaTeX Math & Chemical Typesetting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>50-Quiz Cloud Storage Vault</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Daily Attendance & Streak Tracker</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== DETAILED APP DESCRIPTION & CORE PILLARS ===================== */}
      <section id="app-features" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            PLATFORM CAPABILITIES
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Designed for Rigorous NCERT Learning
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Every feature in U-Quiz is crafted to replace rote memorization with deep conceptual clarity, textbook verification, and active recall.
          </p>
        </div>

        {/* 6 Grid Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Authentic NCERT Alignment
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero hallucinated questions or out-of-syllabus surprises. Aligned strictly with official CBSE NCERT publications, covering updated textbooks including <em>Curiosity</em>, <em>Ganita Prakash</em>, and <em>Exploring Society</em>.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-emerald-400/90 font-medium">
              Classes 1–12 • Updated NCF-SE
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Gemini AI Dynamic Assessments
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Experience dynamic test creation powered by Gemini AI. Choose difficulty levels (Easy for factual recall, Medium for conceptual application, Hard for multi-step reasoning) tailored to your exact revision needs.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-teal-400/90 font-medium">
              Easy, Medium & Hard Cognitive Tiers
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                KaTeX Formula Typesetting
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Say goodbye to corrupted mathematical expressions. Fractions, exponents, radicals, geometric notation, and chemical formulas render with publication-grade mathematical precision.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-cyan-400/90 font-medium">
              Clean Math & Chemistry Syntax
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                24/7 NCERT AI Study Chat
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stuck on an answer or need a textbook derivation? The dedicated Study Chat AI Tutor clarifies concepts, gives contextual hints, and helps you revise any chapter in real time.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-purple-400/90 font-medium">
              Instant Doubt Clearance
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                50-Quiz Cloud Vault & Sharing
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Save your favorite generated tests directly to your secure Cloud Vault. Generate unique 6-character Challenge Codes to share quizzes with friends, study groups, or students.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-amber-400/90 font-medium">
              Cloud Persistence & Challenge Codes
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Daily Attendance & Leaderboard
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Maintain your daily study streak with automatic attendance check-ins. Earn academic points, review comprehensive accuracy metrics, and see where you rank on the Scholar Leaderboard.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-orange-400/90 font-medium">
              Habit Building & Global Ranks
            </div>
          </div>

        </div>
      </section>

      {/* ===================== CURRICULUM SYLLABUS SPOTLIGHT ===================== */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              CURRICULUM COVERAGE
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Official NCERT Textbooks Supported
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Browse syllabus groupings across all grades and textbook editions.
            </p>
          </div>

          {/* Division Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start">
            {divisions.map((div) => (
              <button
                key={div.id}
                onClick={() => setSelectedDivision(div.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedDivision === div.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {div.label}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCurriculum.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">{item.name}</h4>
              </div>
              <div className="text-xs text-emerald-400 font-mono">
                Books: {item.books}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.focus}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== 3 SIMPLE STEPS ===================== */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
            How U-Quiz Works
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Three straightforward steps to boost your exam readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono text-sm mx-auto flex items-center justify-center">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Configure Your Test</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick your grade, subject, and any combination of chapters. Choose 5 to 20 questions with custom difficulty.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold font-mono text-sm mx-auto flex items-center justify-center">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Practice with Explanations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solve interactive questions with instant feedback, textbook references, and KaTeX-formatted solutions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold font-mono text-sm mx-auto flex items-center justify-center">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Track Habits & Sync</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Save quizzes to your 50-item Cloud Vault, maintain your daily study streak, and share challenge codes with friends.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== BOTTOM CTA BANNER ===================== */}
      <section className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-900/90 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START LEARNING NOW</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
            Ready to test your NCERT concepts?
          </h3>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
            Sign in with your Google account to access all quiz modes, save tests to your Cloud Vault, track daily study streaks, and chat with the AI Study Tutor.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onTakeToLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              <span>Continue to Login Screen</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security & Admin Footer in Landing */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Protected with Google Identity & Cloud Encryption</span>
          <button
            onClick={onOpenAdminAuth}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Educator & Admin Portal</span>
          </button>
        </div>
      </section>

    </div>
  );
};
