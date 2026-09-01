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
  Award, 
  Clock, 
  CheckCircle2, 
  X, 
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp
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
  const [isMarking, setIsMarking] = useState(false);
  const [justMarkedSuccess, setJustMarkedSuccess] = useState(false);
  const todayIST = getISTDateString();

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadAttendance();
    }
  }, [isOpen, user?.uid]);

  const loadAttendance = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const records = await fetchUserAttendance(user.uid);
      setAttendanceList(records);
    } catch (e) {
      console.error('Failed to load user attendance:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const hasCheckedInToday = attendanceList.some(r => r.date === todayIST);

  const handleManualCheckIn = async () => {
    if (!user) {
      onSignIn();
      return;
    }
    if (hasCheckedInToday || isMarking) return;

    setIsMarking(true);
    try {
      await recordAttendance(user, 'manual_checkin');
      setJustMarkedSuccess(true);
      await loadAttendance();
      setTimeout(() => setJustMarkedSuccess(false), 4000);
    } catch (e) {
      console.error('Error marking attendance:', e);
    } finally {
      setIsMarking(false);
    }
  };

  if (!isOpen) return null;

  // Calculate unique days attended
  const uniqueDays = Array.from(new Set(attendanceList.map(r => r.date)));
  const totalDaysCount = uniqueDays.length;
  const currentStreak = user?.currentStreak || (hasCheckedInToday ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              My Attendance & Study Streak
            </h3>
            <p className="text-xs text-slate-400">
              Track your daily NCERT revision habits, check-in history, and milestone streaks.
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
            <div className="text-emerald-400 font-bold text-lg font-mono">
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

        {/* Today's Action Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-950 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              hasCheckedInToday 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                : 'bg-slate-800 text-slate-400'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Today's Attendance:</span>
                <span className="font-mono text-emerald-400">{todayIST}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {hasCheckedInToday 
                  ? 'Awesome! Attendance marked for today. Keep up the daily streak!' 
                  : 'Check in today to maintain your revision streak and earn badges.'}
              </p>
            </div>
          </div>

          {!hasCheckedInToday && (
            <button
              onClick={handleManualCheckIn}
              disabled={isMarking}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isMarking ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Mark Present</span>
                </>
              )}
            </button>
          )}

          {hasCheckedInToday && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold shrink-0">
              ✓ Present
            </span>
          )}
        </div>

        {justMarkedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Attendance recorded successfully in the cloud! Current streak updated.</span>
          </div>
        )}

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
                <p className="text-[11px] text-slate-600">Complete a quiz or check in above to log your first day.</p>
              </div>
            ) : (
              attendanceList.map((record) => (
                <div 
                  key={record.id || `${record.date}-${record.timestamp}`}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{record.date}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {record.timeStr || new Date(record.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {record.activityType === 'quiz_completion' 
                          ? `Quiz Completed: ${record.subjectAttempted || 'NCERT Assessment'}`
                          : record.activityType === 'manual_checkin'
                          ? 'Daily Study Check-in'
                          : record.activityType === 'chat_interaction'
                          ? `Study Chat: ${record.subjectAttempted || 'Discussion'}`
                          : 'Platform Login Session'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold">
                      🔥 {record.currentStreak}d Streak
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
