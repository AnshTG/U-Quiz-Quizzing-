import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bug, 
  BookOpen, 
  Lightbulb, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ExternalLink,
  ShieldCheck,
  Check,
  RotateCw,
  Info
} from 'lucide-react';
import { 
  UserProfile, 
  UserFeedback, 
  FeedbackCategory, 
  FeedbackSeverity 
} from '../types';
import { 
  submitUserFeedback, 
  listenToUserFeedbacks 
} from '../services/firebase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialContext?: {
    category?: FeedbackCategory;
    title?: string;
    subject?: string;
    className?: string;
    description?: string;
  };
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  user,
  initialContext
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  
  // Form State
  const [category, setCategory] = useState<FeedbackCategory>(initialContext?.category || 'bug');
  const [severity, setSeverity] = useState<FeedbackSeverity>('medium');
  const [title, setTitle] = useState(initialContext?.title || '');
  const [description, setDescription] = useState(initialContext?.description || '');
  const [relatedSubject, setRelatedSubject] = useState(initialContext?.subject || '');
  const [relatedClass, setRelatedClass] = useState(initialContext?.className || '');
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // User submissions history
  const [myFeedbacks, setMyFeedbacks] = useState<UserFeedback[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Sync initial context if changes
  useEffect(() => {
    if (initialContext) {
      if (initialContext.category) setCategory(initialContext.category);
      if (initialContext.title) setTitle(initialContext.title);
      if (initialContext.subject) setRelatedSubject(initialContext.subject);
      if (initialContext.className) setRelatedClass(initialContext.className);
      if (initialContext.description) setDescription(initialContext.description);
    }
  }, [initialContext]);

  // Subscribe to user feedbacks
  useEffect(() => {
    if (!isOpen || !user.uid) return;
    setIsLoadingHistory(true);
    const unsubscribe = listenToUserFeedbacks(user.uid, (list) => {
      setMyFeedbacks(list);
      setIsLoadingHistory(false);
    });
    return () => unsubscribe();
  }, [isOpen, user.uid]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide both a summary title and detailed description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitUserFeedback({
        category,
        severity,
        title: title.trim(),
        description: description.trim(),
        relatedSubject: relatedSubject.trim() || undefined,
        relatedClass: relatedClass.trim() || undefined,
        deviceInfo: `${navigator.userAgent} (${window.innerWidth}x${window.innerHeight})`
      }, user);

      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('history');
      }, 1500);
    } catch (err: any) {
      console.error('Feedback submit failed:', err);
      setErrorMessage('Failed to submit report. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { id: FeedbackCategory; label: string; icon: any; color: string; desc: string }[] = [
    {
      id: 'bug',
      label: 'Bug Report',
      icon: Bug,
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      desc: 'UI glitches, errors, timer or answer evaluation issues'
    },
    {
      id: 'content_error',
      label: 'NCERT Content Issue',
      icon: BookOpen,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      desc: 'Incorrect answer key, syllabus mismatch or formula typo'
    },
    {
      id: 'feature_request',
      label: 'Feature Request',
      icon: Lightbulb,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      desc: 'Suggest new subject, gamification, or test modes'
    },
    {
      id: 'general',
      label: 'General Feedback',
      icon: MessageSquare,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      desc: 'Appreciation, suggestions or overall study experience'
    }
  ];

  const severities: { id: FeedbackSeverity; label: string; color: string }[] = [
    { id: 'low', label: 'Low (Cosmetic / Suggestion)', color: 'border-slate-700 hover:border-slate-500' },
    { id: 'medium', label: 'Medium (Noticeable Issue)', color: 'border-amber-500/40 text-amber-300' },
    { id: 'high', label: 'High (Affects Quizzing/Score)', color: 'border-orange-500/50 text-orange-400' },
    { id: 'critical', label: 'Critical (Crashes / Blockers)', color: 'border-rose-500/60 text-rose-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
                Feedback & Bug Reports
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono font-semibold">
                  Admin Triaged
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Help us improve U Quiz NCERT engine • Every report is audited
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 bg-slate-900/40 border-b border-slate-800/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Submit Report
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>My Submissions</span>
              {myFeedbacks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-emerald-400 text-[10px] font-mono font-bold">
                  {myFeedbacks.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auth: {user.displayName || user.email}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          {activeTab === 'submit' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Report Category <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(c => {
                    const Icon = c.icon;
                    const isSelected = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? `${c.color} ring-1 ring-emerald-400 shadow-md`
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs mb-1">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{c.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {c.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Summary Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Option B is missing exponent in Class 10 Light Q2"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as FeedbackSeverity)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="low">Low (Minor / Idea)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Wrong Answer)</option>
                    <option value="critical">Critical (Blocking)</option>
                  </select>
                </div>
              </div>

              {/* Optional Context: Class & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">
                    Target Class (Optional)
                  </label>
                  <input
                    type="text"
                    value={relatedClass}
                    onChange={(e) => setRelatedClass(e.target.value)}
                    placeholder="e.g. Class 10 or All"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">
                    Subject / Topic (Optional)
                  </label>
                  <input
                    type="text"
                    value={relatedSubject}
                    onChange={(e) => setRelatedSubject(e.target.value)}
                    placeholder="e.g. Science / Life Processes"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description Details */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Detailed Explanation <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {description.length} / 1500 chars
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={1500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail. If it's a content mistake, mention the question text, the expected answer vs marked answer, and why."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                />
              </div>

              {/* Feedback Error Notice */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Notification */}
              {submitSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Thank you! Your report has been submitted and registered in the Admin triage log.</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Submitted with user verification: {user.email}</span>
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !description.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* My Feedback Submissions Tab */
            <div className="space-y-3">
              {isLoadingHistory ? (
                <div className="text-center py-12 space-y-3">
                  <RotateCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Loading your submitted reports...</p>
                </div>
              ) : myFeedbacks.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/80 p-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">No Reports Submitted Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Found an issue or have an idea? Switch to "Submit Report" to let our team know!
                  </p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    Submit First Report
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Showing {myFeedbacks.length} submitted ticket(s)</span>
                    <span className="text-[11px] text-slate-500">Live Status Updates</span>
                  </div>

                  {myFeedbacks.map((item) => {
                    const statusStyles: Record<string, { label: string; color: string; icon: any }> = {
                      open: { label: 'Open / Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock },
                      under_review: { label: 'Under Review', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: RotateCw },
                      resolved: { label: 'Resolved / Fixed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
                      closed: { label: 'Closed', color: 'bg-slate-700/50 text-slate-400 border-slate-700', icon: Check }
                    };

                    const statusInfo = statusStyles[item.status] || statusStyles.open;
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase">
                                {item.category.replace('_', ' ')}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1 ${statusInfo.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusInfo.label}
                              </span>
                              {item.severity === 'critical' && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                                  CRITICAL
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white pt-0.5">
                              {item.title}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {item.timeIST || item.date}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              ID: {item.id.substring(0, 10)}...
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                          {item.description}
                        </p>

                        {(item.relatedClass || item.relatedSubject) && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            {item.relatedClass && <span>Class: {item.relatedClass}</span>}
                            {item.relatedClass && item.relatedSubject && <span>•</span>}
                            {item.relatedSubject && <span>Subject: {item.relatedSubject}</span>}
                          </div>
                        )}

                        {/* Admin Notes if present */}
                        {item.adminNotes && (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Admin Response / Action Taken
                              </span>
                              {item.resolvedAt && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  {new Date(item.resolvedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed">
                              {item.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
