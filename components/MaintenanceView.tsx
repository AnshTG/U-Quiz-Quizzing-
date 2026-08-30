import React, { useState, useEffect } from 'react';
import { MaintenanceConfig } from '../types';
import { getISTTimeString, getISTDateString } from '../services/firebase';
import { 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  Lock, 
  RefreshCw, 
  Server, 
  CheckCircle2, 
  GraduationCap,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface MaintenanceViewProps {
  config?: MaintenanceConfig;
  onOpenAdminAuth: () => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  config,
  onOpenAdminAuth
}) => {
  const [currentISTTime, setCurrentISTTime] = useState<string>(getISTTimeString());
  const [currentISTDate, setCurrentISTDate] = useState<string>(getISTDateString());
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentISTTime(getISTTimeString());
      setCurrentISTDate(getISTDateString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      window.location.reload();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-300 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-tr from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
              U-Quiz NCERT
            </span>
            <span className="block text-[10px] text-slate-400 font-mono tracking-wide">
              SYSTEM MAINTENANCE
            </span>
          </div>
        </div>

        {/* Live IST Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="hidden sm:inline">IST Live:</span>
          <span>{currentISTTime}</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center flex-1 flex flex-col justify-center items-center">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold mb-6 shadow-inner animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Scheduled System Optimization & Upgrades</span>
        </div>

        {/* Big Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/10 mx-auto">
            <Server className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse text-amber-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-amber-500 text-slate-950 shadow-lg">
            <Activity className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          We'll Be Back Shortly!
        </h1>

        {/* Description or Admin Message */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto shadow-xl">
          <p className="mb-2">
            {config?.message || 
              "U-Quiz is currently undergoing scheduled platform upgrades to improve syllabus accuracy, speed, and real-time assessment capabilities."
            }
          </p>
          {config?.estimatedDuration && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-amber-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Estimated Duration: {config.estimatedDuration}</span>
            </div>
          )}
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm justify-center">
          <button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm transition-all border border-slate-700 hover:border-slate-600 shadow-lg cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Status...' : 'Check Status'}</span>
          </button>

          <button
            onClick={onOpenAdminAuth}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-sm transition-all border border-amber-500/40 shadow-lg cursor-pointer"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Admin Unlock</span>
          </button>
        </div>

        {/* Feature status badges */}
        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4 max-w-md w-full text-left">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Data Safe</span>
            </div>
            <p className="text-[11px] text-slate-400">All student quiz records & streaks intact</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NCERT Engine</span>
            </div>
            <p className="text-[11px] text-slate-400">Syllabus update in progress</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>24/7 Monitored</span>
            </div>
            <p className="text-[11px] text-slate-400">Automated deployment active</p>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <span>U-Quiz NCERT Academic Portal &bull; IST Date: {currentISTDate}</span>
      </footer>
    </div>
  );
};
