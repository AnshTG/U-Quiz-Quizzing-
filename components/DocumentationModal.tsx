import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CalendarCheck, 
  ShieldCheck, 
  Database, 
  MessageSquare, 
  Trophy, 
  Server, 
  HelpCircle, 
  X, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Flame, 
  Search, 
  Globe, 
  QrCode, 
  Lock, 
  Sliders, 
  ChevronRight,
  ExternalLink,
  Code2,
  FileText,
  LogIn
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  isAdmin = false
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'curriculum' | 'ai_engine' | 'attendance' | 'scholar_portal' | 'admin_portal' | 'deployment'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

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
                  U-Quiz Platform Manual & Documentation
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
                  v2.5 Full Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Comprehensive operational guide for Students, Educators, and System Administrators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Documentation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-950/60 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'overview'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Architecture</span>
          </button>

          <button
            onClick={() => setActiveSection('curriculum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'curriculum'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. NCERT Curriculum</span>
          </button>

          <button
            onClick={() => setActiveSection('ai_engine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'ai_engine'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. AI Generation Engine</span>
          </button>

          <button
            onClick={() => setActiveSection('attendance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'attendance'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>4. Auto-Attendance</span>
          </button>

          <button
            onClick={() => setActiveSection('scholar_portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'scholar_portal'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>5. Scholar Portal & Vault</span>
          </button>

          <button
            onClick={() => setActiveSection('admin_portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'admin_portal'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>6. Admin & Teacher Operations</span>
          </button>

          <button
            onClick={() => setActiveSection('deployment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSection === 'deployment'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>7. Vercel & Cloud Hosting</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 text-slate-300 text-sm leading-relaxed">
          
          {/* ================= SECTION 1: ARCHITECTURE OVERVIEW ================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-950 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Chapter 1</span>
                <h3 className="text-xl font-bold text-white font-display">System Overview & Core Philosophy</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  <strong className="text-white">U-Quiz</strong> is an intelligent, real-time NCERT learning and assessment platform built for Indian K-12 students (Classes 1–12), competitive exam aspirants (NEET, JEE, Olympiads), and teachers. The platform pairs cutting-edge generative AI models with rigorous NCERT syllabus mappings, real-time cloud data persistence, zero-touch automated attendance tracking, and full administrative oversight.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">1</div>
                  <h4 className="text-sm font-bold text-white">Full-Stack Cloud Core</h4>
                  <p className="text-xs text-slate-400">
                    Dual Express.js API backend and Vite client. Seamlessly handles AI question generation, streaming mentor chat, and Firestore cloud synchronization.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">2</div>
                  <h4 className="text-sm font-bold text-white">Automated Zero-Touch Daily Tracker</h4>
                  <p className="text-xs text-slate-400">
                    Automatically records daily attendance, check-in timestamps in IST (<code className="text-emerald-400">Asia/Kolkata</code>), and active study streaks upon login and quiz completion without requiring manual button clicks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">3</div>
                  <h4 className="text-sm font-bold text-white">Full Power Admin Control</h4>
                  <p className="text-xs text-slate-400">
                    Direct access for instructors to view every student assessment attempt, live attendance registers, challenge codes, chat moderation, user ban controls, and platform maintenance toggles.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Key Platform Capabilities</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Classes 1–12 Coverage:</strong> Physics, Chemistry, Biology, Mathematics, Social Science, Science, English, Hindi, Sanskrit, and Environmental Studies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong className="text-slate-200">AI Fallback Resilience:</strong> Automatic failover across Gemini 2.5 Flash, Gemini 2.0 Flash, and Gemini 3.7 Flash for guaranteed 99.9% uptime.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Mathematical Rendering:</strong> Full KaTeX/LaTeX support for complex fractions, square roots, chemical formulas, and geometric theorems.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Cloud Challenge Vault:</strong> Save up to 50 custom quizzes and share 6-digit challenge links instantly.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ================= SECTION 2: NCERT CURRICULUM ================= */}
          {activeSection === 'curriculum' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-950 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Chapter 2</span>
                <h3 className="text-xl font-bold text-white font-display">NCERT Curriculum Mapping (Classes 1–12)</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Every quiz topic and chapter is mapped directly to the National Council of Educational Research and Training (NCERT) textbook frameworks, ensuring 100% compliance with CBSE board patterns and state board syllabi.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Grade Level & Subject Structure</h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        <th className="p-3">Grade Band</th>
                        <th className="p-3">Included Classes</th>
                        <th className="p-3">Primary Subjects</th>
                        <th className="p-3">Assessment Focus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="p-3 font-bold text-emerald-400">Primary (1–5)</td>
                        <td className="p-3 font-mono">Class 1, 2, 3, 4, 5</td>
                        <td className="p-3">Mathematics, Environmental Studies (EVS), English, Hindi</td>
                        <td className="p-3 text-slate-400">Visual concepts, basic arithmetic, nature exploration, vocabulary</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-teal-400">Middle School (6–8)</td>
                        <td className="p-3 font-mono">Class 6, 7, 8</td>
                        <td className="p-3">Science, Mathematics, Social Science, History, Geography, Civics, Sanskrit</td>
                        <td className="p-3 text-slate-400">NCERT textbook exercises, experimental concepts, foundational algebra</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-cyan-400">Secondary (9–10)</td>
                        <td className="p-3 font-mono">Class 9, 10</td>
                        <td className="p-3">Science (PCB combined), Mathematics, Social Science, Economics, Civics</td>
                        <td className="p-3 text-slate-400">CBSE Board exam question formats, case-based questions, theorem proofs</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-purple-400">Senior Secondary (11–12)</td>
                        <td className="p-3 font-mono">Class 11, 12</td>
                        <td className="p-3">Physics, Chemistry, Biology, Mathematics, Economics, History, Geography</td>
                        <td className="p-3 text-slate-400">NCERT Exemplar problems, JEE Main/NEET foundational MCQs, derivations</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white">Three Assessment Strength Levels</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">Foundational (Easy)</span>
                    <p className="text-[11px] text-slate-400 pt-1">Direct textbook definition recall, key terms, formula recognition, and fundamental properties.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400">Standard (Medium)</span>
                    <p className="text-[11px] text-slate-400 pt-1">Application of concepts, numerical calculations, multi-step reasoning, and chapter interlinking.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400">Exemplar (Hard)</span>
                    <p className="text-[11px] text-slate-400 pt-1">Olympiad & competitive exam level questions, assertion-reasoning, and in-depth problem solving.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 3: AI GENERATION ENGINE ================= */}
          {activeSection === 'ai_engine' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-950 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Chapter 3</span>
                <h3 className="text-xl font-bold text-white font-display">AI Assessment Synthesis & Mentor Engine</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  U-Quiz utilizes Google's latest Gemini models running behind secure serverless API proxies to synthesize 100% original, syllabus-accurate questions, multiple-choice options, and comprehensive step-by-step explanations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Multi-Model Fallback Chain</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To eliminate rate limits and API disruptions, the backend employs a priority tier:
                  </p>
                  <ol className="space-y-1.5 text-xs font-mono text-slate-300">
                    <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">1.</span> <code>gemini-2.5-flash</code> (Primary Engine - Ultra Fast)</li>
                    <li className="flex items-center gap-2"><span className="text-teal-400 font-bold">2.</span> <code>gemini-2.0-flash</code> (High-Performance Backup)</li>
                    <li className="flex items-center gap-2"><span className="text-cyan-400 font-bold">3.</span> <code>gemini-flash-latest</code> (Standard Global Endpoint)</li>
                    <li className="flex items-center gap-2"><span className="text-purple-400 font-bold">4.</span> <code>gemini-3.7-flash</code> (Next-Gen Reasoning Backup)</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-teal-400" />
                    <span>Strict JSON Schema & Validation</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every generated question passes through recursive JSON sanitizers that strip markdown fences, validate option counts (A, B, C, D), verify unambiguous correct keys, and ensure clean LaTeX mathematical notations (<code className="text-teal-300">$...$</code> and <code className="text-teal-300">$$...$$</code>).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white">Study Chat & AI NCERT Doubt Mentor</h4>
                <p className="text-xs text-slate-400">
                  Scholars can select their specific Class (1–12) and Subject in the <strong className="text-white">Study Chat</strong> view to ask questions, solve homework doubts, and receive instant explanations. Instructors and peers can participate in public study threads with subject tagging.
                </p>
              </div>
            </div>
          )}

          {/* ================= SECTION 4: AUTO ATTENDANCE ================= */}
          {activeSection === 'attendance' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-slate-950 border border-teal-500/20 space-y-2">
                <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">Chapter 4</span>
                <h3 className="text-xl font-bold text-white font-display">Automated Zero-Touch Attendance System</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  U-Quiz eliminates manual "Mark Present" friction. Daily attendance and revision streak tracking are 100% automated upon student activity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">1. Daily Session Login</h4>
                  <p className="text-xs text-slate-400">
                    When a scholar opens the app and authenticates, the system checks today's date in IST. If not already recorded, check-in is logged automatically.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">2. Quiz & Assessment Completion</h4>
                  <p className="text-xs text-slate-400">
                    Submitting any assessment automatically marks attendance with the subject attempted and score attained, updating the student's cloud record.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">3. Continuous Study Streak</h4>
                  <p className="text-xs text-slate-400">
                    Consecutive daily check-ins increment the scholar's active streak flame (<code className="text-orange-400">🔥 Streak</code>), visible on leaderboards and user profiles.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">Timezone & Cloud Synchronization Architecture</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">•</span>
                    <span><strong className="text-slate-200">IST Normalization:</strong> All dates are calculated using <code className="text-teal-300">en-CA</code> format with <code className="text-teal-300">timeZone: 'Asia/Kolkata'</code> (<code className="text-white">YYYY-MM-DD</code>) ensuring perfect synchronization across students in any time zone.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Deterministic Document Keys:</strong> Attendance records use <code className="text-teal-300">/attendance/{'{userId}'}_{'{YYYY-MM-DD}'}</code> to guarantee idempotency and prevent duplicate records per calendar day.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Admin Real-Time Visibility:</strong> Instructors can inspect live attendance across all scholars with date filters, activity type breakdowns, and scholar search.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ================= SECTION 5: SCHOLAR PORTAL ================= */}
          {activeSection === 'scholar_portal' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-emerald-500/10 to-slate-950 border border-purple-500/20 space-y-2">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">Chapter 5</span>
                <h3 className="text-xl font-bold text-white font-display">Scholar Portal, Vault & Challenge Codes</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Explore how students generate quizzes, save assessments to their Cloud Vault, challenge classmates with 6-digit codes, and climb the Leaderboard.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span>Cloud Quiz Vault (Up to 50 Saved Quizzes)</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Scholars can save generated quizzes to their personal Cloud Vault. Saved quizzes preserve exact questions, options, and explanations so students can retake them anytime or review them before school examinations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>6-Digit Challenge Sharing</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Any quiz can be published to the <strong className="text-white">Public Challenge Vault</strong> with a unique 6-digit code or shareable direct URL. Classmates can enter the code in the "Join Code" topbar button to compete on the exact same question set.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Global Scholar Leaderboard</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Points are awarded based on accuracy, quiz completion volume, and daily attendance streaks. Scholar ranks range from <strong className="text-emerald-400">NCERT Novice</strong> to <strong className="text-amber-400">Grandmaster Scholar</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 6: ADMIN PORTAL ================= */}
          {activeSection === 'admin_portal' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-slate-950 border border-amber-500/20 space-y-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">Chapter 6</span>
                <h3 className="text-xl font-bold text-white font-display">Administrator Control Center & Teacher Operations</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Comprehensive administrator console for managing scholars, inspecting assessments, reviewing attendance registers, moderating chats, and controlling global platform state.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>Universal Assessment Matrix</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Live chronological and scholar-grouped view of all quizzes taken across the platform. Instructors can inspect student answers, review question explanations, adjust recorded scores, and delete invalid attempts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-teal-400" />
                    <span>Live Attendance Auditor</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Full attendance log with date picker filter, activity filter (Login, Quiz, Chat), and user search. Allows teachers to verify daily participation for classroom grading.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Scholar Management & Moderation</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Inspect individual scholar accounts, edit total points and streaks, ban disruptive accounts, and moderate public study chat messages.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Maintenance Mode & God-Mode</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Activate global maintenance mode to temporarily gate students with custom announcements while admins maintain full bypass privileges to test and update resources.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 7: DEPLOYMENT & HOSTING ================= */}
          {activeSection === 'deployment' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-slate-950 border border-cyan-500/20 space-y-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Chapter 7</span>
                <h3 className="text-xl font-bold text-white font-display">Vercel & Cloud Hosting Guidelines</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Best practices for deploying U-Quiz on Vercel, Cloud Run, and container environments with high performance and zero configuration errors.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white">1. Environment Variables Configuration</h4>
                  <p className="text-xs text-slate-400">
                    Ensure the following variables are declared in your Vercel Project Settings &gt; Environment Variables:
                  </p>
                  <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`# Server-side Gemini API Secret
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web Config (Optional / Defaults in client config)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...`}
                  </pre>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white">2. Vercel Serverless Function Routing</h4>
                  <p className="text-xs text-slate-400">
                    The platform includes <code className="text-cyan-400">api/index.ts</code> and <code className="text-cyan-400">vercel.json</code> configured to route all <code className="text-cyan-400">/api/*</code> requests automatically to serverless Gemini endpoints while serving the single-page application smoothly.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white">3. Responsive Viewport & Navbar Behavior</h4>
                  <p className="text-xs text-slate-400">
                    All views (including Study Chat and Admin Portal) use dynamic viewport units (<code className="text-teal-300">100dvh</code>) and sticky headers to ensure that the topbar and navigation controls remain visible and functional across all screen sizes and mobile browsers.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>U-Quiz NCERT Assessment System • Documentation Ready</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            Done Reading
          </button>
        </div>

      </div>
    </div>
  );
};
