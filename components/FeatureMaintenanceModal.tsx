import React from 'react';
import { 
  Wrench, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Layers, 
  Trophy, 
  Camera, 
  Globe 
} from 'lucide-react';
import { FeatureKey, PLATFORM_FEATURES, MaintenanceConfig } from '../types';

interface FeatureMaintenanceModalProps {
  isOpen: boolean;
  featureKey: FeatureKey | null;
  maintenanceConfig: MaintenanceConfig;
  isAdminUnlocked?: boolean;
  onClose: () => void;
  onAdminBypass?: () => void;
}

export const FeatureMaintenanceModal: React.FC<FeatureMaintenanceModalProps> = ({
  isOpen,
  featureKey,
  maintenanceConfig,
  isAdminUnlocked = false,
  onClose,
  onAdminBypass
}) => {
  if (!isOpen || !featureKey) return null;

  const featureMeta = PLATFORM_FEATURES.find((f) => f.key === featureKey) || {
    key: featureKey,
    name: 'Feature Service',
    category: 'AI & Generation',
    description: 'This platform feature is currently undergoing maintenance.',
    affectedButtons: ['Feature Button'],
    defaultMessage: 'This feature is currently undergoing scheduled platform upgrades. Please check back shortly.'
  };

  const featureConfig = maintenanceConfig.features?.[featureKey];
  const customMessage = featureConfig?.message?.trim() || featureMeta.defaultMessage;

  const getFeatureIcon = (key: FeatureKey) => {
    switch (key) {
      case 'webpage_fetch':
        return <Globe className="w-6 h-6 text-emerald-400" />;
      case 'quiz_generation':
        return <Sparkles className="w-6 h-6 text-amber-400" />;
      case 'ai_chat':
        return <MessageSquare className="w-6 h-6 text-cyan-400" />;
      case 'ocr_scan':
        return <Camera className="w-6 h-6 text-rose-400" />;
      case 'multiplayer':
        return <Users className="w-6 h-6 text-purple-400" />;
      case 'curriculum':
        return <BookOpen className="w-6 h-6 text-blue-400" />;
      case 'flashcards':
        return <Layers className="w-6 h-6 text-lime-400" />;
      case 'leaderboard':
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 'feedback_submit':
        return <AlertCircle className="w-6 h-6 text-slate-400" />;
      default:
        return <Wrench className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/10 space-y-5 text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon & Badges */}
        <div className="flex items-start gap-4 pr-8">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            {getFeatureIcon(featureKey)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                Scheduled Maintenance
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {featureMeta.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              {featureMeta.name}
            </h3>
          </div>
        </div>

        {/* Admin Custom Message Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Administrator Notice</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {customMessage}
          </p>
        </div>

        {/* Affected Buttons & Features summary */}
        <div className="space-y-2 text-xs">
          <span className="text-slate-400 font-medium">Temporarily Paused Buttons / Operations:</span>
          <div className="flex flex-wrap gap-1.5">
            {featureMeta.affectedButtons.map((btn, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]"
              >
                {btn}
              </span>
            ))}
          </div>
        </div>

        {/* Helpful Alternatives / Actions */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
          <strong>Tip for Scholars:</strong> All other active subjects, curriculum notes, practice tests, and syllabus directories remain fully accessible while this feature upgrade completes.
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
          {isAdminUnlocked && onAdminBypass && (
            <button
              onClick={() => {
                onAdminBypass();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Bypass Feature</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
