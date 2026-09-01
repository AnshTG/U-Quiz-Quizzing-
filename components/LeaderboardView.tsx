import React, { useState, useEffect } from 'react';
import { LeaderboardUser, UserProfile, AppState } from '../types';
import { fetchLeaderboardTopUsers, subscribeToLeaderboard, LeaderboardResult } from '../services/firebase';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Sparkles, 
  RotateCw, 
  Zap, 
  Target, 
  BookOpen, 
  Award, 
  Crown,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Radio,
  ArrowLeft
} from 'lucide-react';

interface LeaderboardViewProps {
  user: UserProfile | null;
  onNavigate: (view: AppState) => void;
  onStartQuiz: () => void;
  onSignIn: () => void;
}

type SortMetric = 'score' | 'quizzes' | 'accuracy';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  onNavigate,
  onStartQuiz,
  onSignIn,
}) => {
  const [data, setData] = useState<LeaderboardResult>({
    topUsers: [],
    currentUserRank: null,
    totalParticipants: 0,
    lastUpdated: '',
  });
  const [sortMetric, setSortMetric] = useState<SortMetric>('score');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    // Real-time live listener for leaderboard rankings
    const unsubscribe = subscribeToLeaderboard(user?.uid, sortMetric, (result) => {
      setData(result);
      setIsLoading(false);
      setIsRefreshing(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid, sortMetric]);

  const loadLeaderboard = async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLeaderboardTopUsers(user?.uid, sortMetric);
      setData(result);
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const top3 = data.topUsers.slice(0, 3);
  const rank4to10 = data.topUsers.slice(3, 10);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-lg shadow-amber-500/20">
            <Crown className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-slate-300/10">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-700 to-orange-800 text-amber-100 flex items-center justify-center font-black text-sm shadow-md shadow-orange-900/20">
            3
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs font-mono">
            #{rank}
          </div>
        );
    }
  };

  const getTierLabel = (rank: number, score: number) => {
    if (rank === 1) return { label: 'Grand Champion', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (rank <= 3) return { label: 'Apex Scholar', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    if (rank <= 5) return { label: 'Master Ace', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    if (score >= 50) return { label: 'Elite Achiever', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    return { label: 'Rising Star', color: 'bg-slate-800 text-slate-400 border-slate-700' };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => onNavigate(AppState.HOME)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </button>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">Live Ranks</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Real-Time Scholar Standings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              NCERT Quiz Leaderboard
              <span className="text-sm font-normal text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700 font-mono">
                Top 10
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Real-time rankings aggregated from quiz submissions across Classes 1 to 12. Complete quizzes to score points, boost accuracy, and claim your place at the top.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { loadLeaderboard(); }}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
              title="Refresh Leaderboard"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={onStartQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Take a Quiz Now</span>
            </button>
          </div>
        </div>

        {/* Filter and Metric Selectors */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 w-fit">
            <button
              onClick={() => setSortMetric('score')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                sortMetric === 'score'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Total Points</span>
            </button>
            <button
              onClick={() => setSortMetric('quizzes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                sortMetric === 'quizzes'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Quizzes Solved</span>
            </button>
            <button
              onClick={() => setSortMetric('accuracy')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                sortMetric === 'accuracy'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Accuracy %</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{data.totalParticipants} Active Scholars</span>
            </span>
            {data.lastUpdated && (
              <span className="text-slate-500 font-mono text-[11px]">
                Updated at {data.lastUpdated}
              </span>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-bounce">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-200">Aggregating real-time leaderboard rankings...</p>
          <p className="text-xs text-slate-500">Querying live quiz submissions across Class 1-12 batches.</p>
        </div>
      ) : data.topUsers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">No Quiz Submissions Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Be the very first scholar to complete an NCERT syllabus assessment and claim the #1 spot on the leaderboard!
            </p>
          </div>
          <button
            onClick={onStartQuiz}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Launch First Assessment</span>
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Showcase */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* 2nd Place */}
              {top3[1] ? (
                <div className={`order-2 md:order-1 relative rounded-2xl p-5 border transition-all ${
                  top3[1].isCurrentUser 
                    ? 'bg-slate-900/90 border-emerald-500/50 ring-1 ring-emerald-500/30' 
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                } flex flex-col justify-between space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-300 text-slate-950 flex items-center justify-center text-xs font-black">
                        2
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Runner Up
                      </span>
                    </div>
                    {top3[1].isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        You
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3.5">
                    {top3[1].photoURL ? (
                      <img
                        src={top3[1].photoURL}
                        alt={top3[1].displayName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-slate-200 flex items-center justify-center font-bold text-lg border border-slate-700">
                        {top3[1].displayName[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate">
                        {top3[1].displayName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.2 rounded-md font-semibold border ${getTierLabel(2, top3[1].totalScore).color}`}>
                          {getTierLabel(2, top3[1].totalScore).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
                    <div className="p-2 rounded-xl bg-slate-950/60">
                      <div className="text-xs text-slate-400">Score</div>
                      <div className="text-sm font-extrabold text-amber-400 font-mono">{top3[1].totalScore}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60">
                      <div className="text-xs text-slate-400">Quizzes</div>
                      <div className="text-sm font-bold text-white font-mono">{top3[1].quizzesCompleted}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60">
                      <div className="text-xs text-slate-400">Accuracy</div>
                      <div className="text-sm font-bold text-cyan-400 font-mono">{top3[1].accuracy}%</div>
                    </div>
                  </div>
                </div>
              ) : <div className="order-2 md:order-1" />}

              {/* 1st Place (Champion) */}
              {top3[0] && (
                <div className={`order-1 md:order-2 relative rounded-3xl p-6 border transition-all ${
                  top3[0].isCurrentUser 
                    ? 'bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/60 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/40' 
                    : 'bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/40 shadow-xl shadow-amber-500/5'
                } flex flex-col justify-between space-y-4 -mt-2 md:-mt-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-xs shadow-lg shadow-amber-500/30">
                        <Crown className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                        #1 Champion
                      </span>
                    </div>
                    {top3[0].isCurrentUser && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 shadow-md">
                        You (Rank #1)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {top3[0].photoURL ? (
                        <img
                          src={top3[0].photoURL}
                          alt={top3[0].displayName}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-lg shadow-amber-500/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-2xl border-2 border-amber-300 shadow-lg shadow-amber-500/20">
                          {top3[0].displayName[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 p-1 bg-slate-950 rounded-full border border-amber-400 text-amber-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-extrabold text-white truncate">
                        {top3[0].displayName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold border ${getTierLabel(1, top3[0].totalScore).color}`}>
                          {getTierLabel(1, top3[0].totalScore).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-amber-500/20 text-center">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <div className="text-[11px] text-amber-300 font-medium">Total Score</div>
                      <div className="text-base font-black text-amber-400 font-mono">{top3[0].totalScore}</div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Quizzes</div>
                      <div className="text-base font-bold text-white font-mono">{top3[0].quizzesCompleted}</div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Accuracy</div>
                      <div className="text-base font-bold text-cyan-400 font-mono">{top3[0].accuracy}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] ? (
                <div className={`order-3 relative rounded-2xl p-5 border transition-all ${
                  top3[2].isCurrentUser 
                    ? 'bg-slate-900/90 border-emerald-500/50 ring-1 ring-emerald-500/30' 
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                } flex flex-col justify-between space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-orange-700 text-amber-100 flex items-center justify-center text-xs font-black">
                        3
                      </span>
                      <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                        3rd Place
                      </span>
                    </div>
                    {top3[2].isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        You
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3.5">
                    {top3[2].photoURL ? (
                      <img
                        src={top3[2].photoURL}
                        alt={top3[2].displayName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-800 to-amber-900 text-orange-200 flex items-center justify-center font-bold text-lg border border-orange-700/50">
                        {top3[2].displayName[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate">
                        {top3[2].displayName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.2 rounded-md font-semibold border ${getTierLabel(3, top3[2].totalScore).color}`}>
                          {getTierLabel(3, top3[2].totalScore).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
                    <div className="p-2 rounded-xl bg-slate-950/60">
                      <div className="text-xs text-slate-400">Score</div>
                      <div className="text-sm font-extrabold text-amber-400 font-mono">{top3[2].totalScore}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60">
                      <div className="text-xs text-slate-400">Quizzes</div>
                      <div className="text-sm font-bold text-white font-mono">{top3[2].quizzesCompleted}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60">
                      <div className="text-xs text-slate-400">Accuracy</div>
                      <div className="text-sm font-bold text-cyan-400 font-mono">{top3[2].accuracy}%</div>
                    </div>
                  </div>
                </div>
              ) : <div className="order-3" />}
            </div>
          )}

          {/* Full Top 10 Standings Table */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Medal className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Top 10 Hall of Fame</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Sorted by {sortMetric === 'score' ? 'Total Points' : sortMetric === 'quizzes' ? 'Quizzes Solved' : 'Accuracy %'}
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 overflow-x-auto">
              {data.topUsers.map((item) => {
                const tier = getTierLabel(item.rank, item.totalScore);
                return (
                  <div
                    key={item.uid}
                    className={`flex items-center justify-between gap-4 p-4 sm:px-6 transition-colors ${
                      item.isCurrentUser 
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400' 
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank & User Info */}
                    <div className="flex items-center gap-3.5 min-w-[200px] sm:min-w-[260px]">
                      {getRankBadge(item.rank)}

                      {item.photoURL ? (
                        <img
                          src={item.photoURL}
                          alt={item.displayName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm border border-slate-700 shrink-0">
                          {item.displayName[0]?.toUpperCase() || 'U'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate block">
                            {item.displayName}
                          </span>
                          {item.isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-slate-950">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.2 rounded-md font-semibold border ${tier.color}`}>
                          {tier.label}
                        </span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                      <div className="text-center min-w-[65px]">
                        <span className="block text-[11px] text-slate-400">Quizzes</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-200 font-mono">
                          {item.quizzesCompleted}
                        </span>
                      </div>

                      <div className="text-center min-w-[65px]">
                        <span className="block text-[11px] text-slate-400">Accuracy</span>
                        <span className="text-xs sm:text-sm font-bold text-cyan-400 font-mono">
                          {item.accuracy}%
                        </span>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <span className="block text-[11px] text-slate-400">Total Score</span>
                        <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                          {item.totalScore} <span className="text-[10px] font-normal text-slate-500">pts</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current User Standing Banner */}
          {user && data.currentUserRank && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shadow-md shadow-emerald-500/20">
                  #{data.currentUserRank.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      Your Global Standing: Rank #{data.currentUserRank.rank} of {data.totalParticipants}
                    </span>
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {data.currentUserRank.rank <= 10 
                      ? '🎉 Amazing! You are currently in the National Top 10 Hall of Fame!' 
                      : `You need ${Math.max(1, (data.topUsers[9]?.totalScore || 0) - data.currentUserRank.totalScore + 1)} more points to break into the Top 10.`}
                  </p>
                </div>
              </div>

              <button
                onClick={onStartQuiz}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Play & Rank Up</span>
              </button>
            </div>
          )}

          {!user && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
              <div className="inline-flex p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Want to record your score on the leaderboard?</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Sign in with Google to sync your quiz scores, save assessments to your Cloud Vault, and track your global ranking.
              </p>
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                <span>Sign in with Google</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};
