
/**
 * Leaderboard Component
 * Displays player rankings based on ELO MMR system
 */

import { Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeaderboardPlayer {
  rank: number;
  name: string;
  elo: number;
  change: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
}

export default function Leaderboard() {
  // Mock leaderboard data
  const leaderboardData: LeaderboardPlayer[] = [
    { rank: 1, name: 'HockeyMaster', elo: 1950, change: 25, wins: 48, losses: 19, winRate: 0.72, streak: 3 },
    { rank: 2, name: 'SC2Legend', elo: 1920, change: -12, wins: 42, losses: 15, winRate: 0.74, streak: -1 },
    { rank: 3, name: 'ProtossPro', elo: 1850, change: 15, wins: 31, losses: 14, winRate: 0.69, streak: 4 },
    { rank: 4, name: 'ZealotKing', elo: 1720, change: 8, wins: 18, losses: 14, winRate: 0.56, streak: 2 },
    { rank: 5, name: 'PuckHunter', elo: 1680, change: -5, wins: 22, losses: 24, winRate: 0.48, streak: -2 },
    { rank: 6, name: 'GoalGetter', elo: 1650, change: 0, wins: 15, losses: 16, winRate: 0.48, streak: 1 },
    { rank: 7, name: 'AdeptScorer', elo: 1620, change: 18, wins: 12, losses: 18, winRate: 0.40, streak: -3 },
    { rank: 8, name: 'StrikeForce', elo: 1580, change: -10, wins: 8, losses: 12, winRate: 0.40, streak: 1 },
  ];

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-400 to-gray-600';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Leaderboard</h2>
        <p className="text-gray-400">Top players ranked by ELO MMR system</p>
      </div>

      {/* Top 3 Players */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {leaderboardData.slice(0, 3).map((player) => (
          <div key={player.rank} className={`bg-gradient-to-br ${getRankColor(player.rank)} rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200`}>
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                {player.rank === 1 && <Crown className="w-6 h-6 mr-2" />}
                <div className="text-2xl font-bold">#{player.rank}</div>
              </div>
              <div className="text-xl font-bold mb-2">{player.name}</div>
              <div className="text-3xl font-bold mb-2">{player.elo}</div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                {getTrendIcon(player.change)}
                <span>{Math.abs(player.change)} ELO</span>
              </div>
              <div className="text-sm opacity-90 mt-2">
                {player.wins}W - {player.losses}L ({(player.winRate * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800/50 border-b border-gray-700 font-semibold text-gray-400">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-2">ELO</div>
          <div className="col-span-2">Change</div>
          <div className="col-span-3">Record</div>
        </div>
        
        {leaderboardData.map((player) => (
          <div key={player.rank} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/20 transition-colors">
            <div className="col-span-1 font-bold">#{player.rank}</div>
            <div className="col-span-4 font-medium">{player.name}</div>
            <div className="col-span-2 font-semibold">{player.elo}</div>
            <div className="col-span-2 flex items-center space-x-1">
              {getTrendIcon(player.change)}
              <span className={player.change > 0 ? 'text-green-400' : player.change < 0 ? 'text-red-400' : 'text-gray-400'}>
                {Math.abs(player.change)}
              </span>
            </div>
            <div className="col-span-3 text-sm text-gray-400">
              {player.wins}W - {player.losses}L • {(player.winRate * 100).toFixed(1)}%
              {player.streak !== 0 && (
                <span className={`ml-2 ${player.streak > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {player.streak > 0 ? '🔥' : '💀'} {Math.abs(player.streak)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Footer */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-gray-400 text-sm">
        <div>Total Players: 247</div>
        <div>Average ELO: 1620</div>
        <div>Last Updated: Today</div>
      </div>
    </div>
  );
}
