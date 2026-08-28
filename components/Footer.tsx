import React from 'react';
import { BookOpen, Sparkles, Mail, AtSign, ExternalLink, ShieldCheck } from 'lucide-react';
import { AppState } from '../types';

interface FooterProps {
  onNavigate: (view: AppState) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-400 p-0.5 shadow-md shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-extrabold text-emerald-400 font-display">U</span>
                </div>
              </div>
              <span className="text-xl font-bold font-display text-white">
                U Quiz <span className="text-emerald-400 font-mono text-sm">NCERT AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              A dedicated AI-assisted assessment platform strictly structured around the official NCERT syllabus for Classes 1 to 12. Generates dynamic, concept-aligned multiple-choice questions with thorough step-by-step rationales.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Strict Rationalized Syllabus • Classes 1–12 • Multi-difficulty</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button 
                  onClick={() => onNavigate(AppState.HOME)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate(AppState.SETUP)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Custom Quiz Generator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate(AppState.CURRICULUM)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  NCERT Curriculum Map
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate(AppState.HISTORY)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Assessment History
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Developer & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Connect & Support
            </h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <a 
                href="https://instagram.com/anshtgyadav" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors group"
              >
                <AtSign className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                <span>@anshtgyadav</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a 
                href="mailto:anshyadavtg@gmail.com" 
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors group"
              >
                <Mail className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                <span>anshyadavtg@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            All Rights Reserved © U Quiz {new Date().getFullYear()} • Developed by Ansh Yadav
          </div>
          <div className="text-slate-400 flex items-center gap-1.5 font-mono">
            Powered by <span className="text-slate-300">Gemini 2.5 Flash</span> + NCERT Matrix
          </div>
        </div>
      </div>
    </footer>
  );
};
