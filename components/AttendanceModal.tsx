import React, { useState, useEffect } from 'react';
import { UserProfile, AttendanceRecord } from '../types';
import { 
  fetchUserAttendance, 
  recordAttendance, 
  getISTDateString, 
  getISTTimeString 
} from '../services/firebase';
import { 
  CalendarCheck, 
  Calendar, 
  Flame, 
  Clock, 
  CheckCircle2, 
  X, 
  Sparkles,
  Zap,
  Activity,
  ShieldCheck
} from 'lucide-react';

interface AttendanceModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  user,
  isOpen,
  onClose,
  onSignIn
}) => {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoLogging, setIsAutoLogging] = useState(false);
  const todayIST = getISTDateString();

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadAndAutoRecordAttendance();
    }
  }, [isOpen, user?.uid]);

  const loadAndAutoRecordAttendance = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      let records = await fetchUserAttendance(user.uid);
      const alreadyLoggedToday = records.some(r => r.date === todayIST);
      
      // Auto-record attendance if not logged today yet
      if (!alreadyLoggedToday && !user.uid.startsWith('guest_')) {
        setIsAutoLogging(true);
        try {
          const newRec = await recordAttendance(user, 'daily_login');
          records = [newRec, ...records];
        } catch (autoErr) {
          console.warn('Auto attendance recording notice:', autoErr);
        } finally {
          setIsAutoLogging(false);
        }
      }
      
      setAttendanceList(records);
    } catch (e) {
      console.error('Failed to load user attendance:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calculate unique days attended
  const uniqueDays = Array.from(new Set(attendanceList.map(r => r.date)));
  const totalDaysCount = uniqueDays.length;
  const hasCheckedInToday = attendanceList.some(r => r.date === todayIST);
  const currentStreak = user?.currentStreak || (hasCheckedInToday ? Math.max(1, totalDaysCount) : totalDaysCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/10">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-display text-white">
                Attendance & Study Streak
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30 text-[10px] font-mono font-bold uppercase tracking-wider hidden xs:inline-block">
                Auto-Logged
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automated daily revision tracker & continuous streak synchronization
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-orange-400 font-bold text-lg font-mono">
              <Flame className="w-4 h-4 fill-orange-400" />
              <span>{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Active Streak
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="text-teal-400 font-bold text-lg font-mono">
              {totalDaysCount} {totalDaysCount === 1 ? 'Day' : 'Days'}
            </div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Total Check-ins
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <div className="text-purple-400 font-bold text-lg font-mono">
              {user?.quizzesCompleted || 0}
            </div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Quizzes Done
            </span>
          </div>
        </div>

        {/* Automated System Status Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-slate-950 border border-teal-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              hasCheckedInToday 
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20' 
                : 'bg-slate-800 text-teal-400'
            }`}>
              {hasCheckedInToday ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Today's Status (IST):</span>
                <span className="font-mono text-teal-400">{todayIST}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {hasCheckedInToday 
                  ? 'Attendance automatically recorded for today. Your daily streak is active!' 
                  : isAutoLogging 
                  ? 'Syncing today\'s attendance automatically with the cloud...' 
                  : 'Attendance records automatically on login and quiz completion.'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {hasCheckedInToday ? (
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Present</span>
              </span>
            ) : isAutoLogging ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-teal-400 text-xs font-mono">
                <div className="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <span>Syncing</span>
              </div>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono font-bold">
                Auto-Tracking
              </span>
            )}
          </div>
        </div>

        {/* Information Callout */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Zero-Click Engine:</strong> Attendance is automatically verified and uploaded to the instructor database whenever you login, complete assessments, or study in chat.
          </span>
        </div>

        {/* History Log List */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Recent Activity & Check-in Logs</span>
            <span className="font-mono text-[11px]">{attendanceList.length} Records</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-56">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Loading attendance history...
              </div>
            ) : attendanceList.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/60 space-y-1">
                <Calendar className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">No attendance records logged yet</p>
                <p className="text-[11px] text-slate-600">Complete an assessment to log your first verified record.</p>
              </div>
            ) : (
              attendanceList.map((record) => (
                <div 
                  key={record.id || `${record.date}-${record.timestamp}`}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{record.date}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {record.timeStr || (record.timestamp ? new Date(record.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'IST')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {record.activityType === 'quiz_completion' 
                          ? `Quiz Completed: ${record.subjectAttempted || 'NCERT Assessment'}`
                          : record.activityType === 'manual_checkin' || record.activityType === 'daily_login'
                          ? 'Daily Session Auto-Checkin'
                          : record.activityType === 'chat_interaction'
                          ? `Study Chat: ${record.subjectAttempted || 'Discussion'}`
                          : 'Platform Activity Session'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold">
                      🔥 {record.currentStreak || 1}d Streak
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
