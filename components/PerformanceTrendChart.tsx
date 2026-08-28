import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { QuizResultRecord, UserProfile } from '../types';
import { fetchUserQuizHistory, subscribeToUserQuizHistory } from '../services/firebase';
import { TrendingUp, Award, Clock, Sparkles, Activity, History } from 'lucide-react';

interface PerformanceTrendChartProps {
  currentSession?: {
    percentage: number;
    score: number;
    total: number;
    subject: string;
    grade: string;
    timestamp: number;
    timeSpentSeconds?: number;
  };
  user?: UserProfile | null;
  history?: QuizResultRecord[];
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  currentSession,
  user,
  history: propHistory = []
}) => {
  const [sessions, setSessions] = useState<QuizResultRecord[]>(propHistory);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load and subscribe in real-time to past quiz history
  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      const unsubscribe = subscribeToUserQuizHistory(user.uid, (cloudHistory) => {
        setSessions(cloudHistory);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local fallback from localStorage
      try {
        const stored = localStorage.getItem('uquiz_assessment_history');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSessions(parsed);
          }
        }
      } catch (e) {
        console.warn('Could not read local history:', e);
      }
    }
  }, [user?.uid]);

  // Combine and sort up to 10 most recent sessions
  let allRecords: QuizResultRecord[] = [...sessions];

  // If current session is provided and not yet in the list, synthesize/prepend it
  if (currentSession && (allRecords.length === 0 || allRecords[0]?.score !== currentSession.score || allRecords[0]?.total !== currentSession.total)) {
    // Only include if not duplicate of first record
    const isAlreadyFirst = allRecords[0] && Math.abs(new Date(allRecords[0].date).getTime() - currentSession.timestamp) < 5000;
    if (!isAlreadyFirst) {
      allRecords = [{
        id: `current_${currentSession.timestamp}`,
        date: new Date(currentSession.timestamp).toISOString(),
        config: {
          class: currentSession.grade as any,
          subject: currentSession.subject as any,
          topics: ['Recent'],
          strength: 'Medium',
          quantity: currentSession.total
        },
        score: currentSession.score,
        total: currentSession.total,
        timeSpentSeconds: currentSession.timeSpentSeconds || 0,
        questions: [],
        userAnswers: []
      }, ...allRecords];
    }
  }

  // Take last 10 quiz sessions in chronological order (oldest to newest for trendline)
  const recentSessions = allRecords.slice(0, 10).reverse();

  if (recentSessions.length === 0) {
    return null;
  }

  // Format data points for Recharts
  const chartData = recentSessions.map((session, index) => {
    const accuracy = session.total > 0 ? Math.round((session.score / session.total) * 100) : 0;
    const dateObj = new Date(session.date);
    const dateFormatted = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isLast = index === recentSessions.length - 1;

    return {
      sessionNumber: index + 1,
      name: isLast ? 'Current' : `Quiz #${index + 1}`,
      shortLabel: `#${index + 1}`,
      date: dateFormatted,
      time: timeFormatted,
      subject: session.config?.subject || 'General Assessment',
      grade: session.config?.class || '',
      score: session.score,
      total: session.total,
      accuracy,
      timeSpentSeconds: session.timeSpentSeconds || 0,
      topics: session.config?.topics?.join(', ') || 'All topics',
      isCurrent: isLast
    };
  });

  const latestAccuracy = chartData[chartData.length - 1]?.accuracy ?? 0;
  const previousAccuracy = chartData.length > 1 ? chartData[chartData.length - 2]?.accuracy : latestAccuracy;
  const trendDiff = latestAccuracy - previousAccuracy;

  const averageAccuracy = Math.round(
    chartData.reduce((acc, curr) => acc + curr.accuracy, 0) / chartData.length
  );

  const highestAccuracy = Math.max(...chartData.map(d => d.accuracy));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[180px] z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${data.isCurrent ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              {data.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{data.date}</span>
          </div>
          <div className="text-slate-300 font-semibold truncate">
            {data.grade} {data.subject}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Score Achieved:</span>
            <span className="font-mono font-bold text-amber-400">{data.score}/{data.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Accuracy Rate:</span>
            <span className="font-mono font-black text-emerald-400 text-sm">{data.accuracy}%</span>
          </div>
          {data.timeSpentSeconds > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-slate-800/60">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400" /> Time:</span>
              <span className="font-mono text-cyan-300">{Math.floor(data.timeSpentSeconds / 60)}m {data.timeSpentSeconds % 60}s</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-7 shadow-2xl space-y-5">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">
              10-Session Performance Trajectory
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Recharts Live
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time accuracy % progression across your last {chartData.length} completed NCERT quizzes.
          </p>
        </div>

        {/* Highlight Stats Pill */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 p-1.5 px-3 rounded-2xl border border-slate-800/80 w-fit">
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Average</span>
            <span className="text-xs font-bold text-slate-200 font-mono">{averageAccuracy}%</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Peak</span>
            <span className="text-xs font-black text-amber-400 font-mono">{highestAccuracy}%</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Trajectory</span>
            <span className={`text-xs font-bold font-mono ${trendDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trendDiff >= 0 ? `+${trendDiff}%` : `${trendDiff}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 sm:h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />

            <XAxis
              dataKey="name"
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => `${val}%`}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine
              y={averageAccuracy}
              stroke="#eab308"
              strokeDasharray="4 4"
              opacity={0.6}
              label={{
                value: `Avg: ${averageAccuracy}%`,
                position: 'right',
                fill: '#eab308',
                fontSize: 10
              }}
            />

            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#accuracyGradient)"
              activeDot={{
                r: 6,
                fill: '#10b981',
                stroke: '#0f172a',
                strokeWidth: 3
              }}
              dot={{
                r: 3.5,
                fill: '#10b981',
                strokeWidth: 1,
                stroke: '#0f172a'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Insight Note */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {latestAccuracy >= 80 
              ? 'Outstanding performance trajectory! Keep up the mastery.' 
              : latestAccuracy >= 50
              ? 'Steady progress. Reviewing missed questions will boost your mastery curve.'
              : 'Focus on NCERT conceptual summaries to accelerate your accuracy rate.'}
          </span>
        </div>
        <span className="font-mono text-slate-500 hidden sm:inline">
          {chartData.length} of 10 Data Points Synchronized
        </span>
      </div>
    </div>
  );
};
