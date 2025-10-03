
/**
 * Player Statistics Component
 * Displays detailed player statistics and performance metrics
 */

import { TrendingUp, Target, Award, Clock } from 'lucide-react';

interface PlayerStats {
  name: string;
  elo: number;
  rank: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  averageGameTime: string;
  favoriteMap: string;
  eloHistory: number[];
}

export default function PlayerStats() {
  // Mock player data
  const playerStats: PlayerStats = {
    name: 'ProtossPro',
    elo: 1850,
    rank: 3,
    gamesPlayed: 45,
    wins: 31,
    losses: 14,
    winRate: 0.68,
    streak: 4,
    averageGameTime: '12:34',
    favoriteMap: 'Hockey Arena',
    eloHistory: [1600, 1650, 1720, 1680, 1750, 1820, 1850],
  };

  const StatCard = ({ icon: Icon, label, value, subtext, trend }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Icon className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">{label}</span>
          </div>
          <div className="text-2xl font-bold">{value}</div>
          {subtext && <div className="text-sm text-gray-500">{subtext}</div>}
        </div>
        {trend && (
          <div className={`w-3 h-3 rounded-full ${
            trend === 'up' ? 'bg-green-500' : 
            trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
          }`} />
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Player Statistics</h2>
        <p className="text-gray-400">Detailed performance metrics and ELO progression</p>
      </div>

      {/* Player Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 mb-6 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{playerStats.name}</h3>
            <p className="text-gray-400">Rank #{playerStats.rank} • ELO: {playerStats.elo}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Current Streak</div>
            <div className={`text-xl font-bold ${playerStats.streak > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {playerStats.streak > 0 ? '🔥' : '💀'} {Math.abs(playerStats.streak)} {playerStats.streak > 0 ? 'Wins' : 'Losses'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={Award} 
          label="Win Rate" 
          value={`${(playerStats.winRate * 100).toFixed(1)}%`}
          subtext={`${playerStats.wins}W - ${playerStats.losses}L`}
          trend="up"
        />
        <StatCard 
          icon={Target} 
          label="ELO Rating" 
          value={playerStats.elo}
          subtext="Current MMR"
          trend="up"
        />
        <StatCard 
          icon={Clock} 
          label="Avg Game Time" 
          value={playerStats.averageGameTime}
          subtext="per match"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Games Played" 
          value={playerStats.gamesPlayed}
          subtext="Total matches"
        />
      </div>

      {/* ELO Progress Chart */}
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700 mb-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          ELO Progression
        </h3>
        <div className="h-48 flex items-end space-x-2">
          {playerStats.eloHistory.map((elo, index) => {
            const maxElo = Math.max(...playerStats.eloHistory);
            const minElo = Math.min(...playerStats.eloHistory);
            const height = ((elo - minElo) / (maxElo - minElo)) * 100;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ height: `${Math.max(height, 10)}%` }}
                />
                <div className="text-xs text-gray-500 mt-2">{elo}</div>
                <div className="text-xs text-gray-600">Game {index + 1}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
          <h4 className="font-bold mb-4 text-lg">Performance Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Favorite Map</span>
              <span className="font-semibold">{playerStats.favoriteMap}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Best Streak</span>
              <span className="font-semibold text-green-400">8 wins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Peak ELO</span>
              <span className="font-semibold">1920</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
          <h4 className="font-bold mb-4 text-lg">Recent Activity</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Last Match</span>
              <span className="font-semibold text-green-400">Win vs ZealotKing</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ELO Change</span>
              <span className="font-semibold text-green-400">+15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Match Duration</span>
              <span className="font-semibold">14:23</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
