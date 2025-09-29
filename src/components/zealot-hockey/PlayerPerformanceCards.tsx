/**
 * Player performance cards component for hockey statistics
 */

import React from 'react';
import { HockeyPlayerStats } from '../../types/hockey-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, Target, Zap, Shield, TrendingUp } from 'lucide-react';

interface PlayerPerformanceCardsProps {
  stats: HockeyPlayerStats[];
}

export const PlayerPerformanceCards: React.FC<PlayerPerformanceCardsProps> = ({ stats }) => {
  if (stats.length === 0) {
    return null;
  }

  // Group stats by player to show aggregated performance
  const playerStats = stats.reduce((acc, stat) => {
    const playerId = stat.accountId;
    if (!acc[playerId]) {
      acc[playerId] = {
        ...stat,
        totalGames: 1,
        totalGoals: stat.goals,
        totalAssists: stat.assists,
        totalShots: stat.shots,
        totalPoints: (stat.goals + stat.assists),
        totalPickups: stat.pickups,
        totalPasses: stat.passes,
        totalSaves: stat.saves,
        totalPossession: stat.possession
      };
    } else {
      acc[playerId].totalGames += 1;
      acc[playerId].totalGoals += stat.goals;
      acc[playerId].totalAssists += stat.assists;
      acc[playerId].totalShots += stat.shots;
      acc[playerId].totalPoints += (stat.goals + stat.assists);
      acc[playerId].totalPickups += stat.pickups;
      acc[playerId].totalPasses += stat.passes;
      acc[playerId].totalSaves += stat.saves;
      acc[playerId].totalPossession += stat.possession;
    }
    return acc;
  }, {} as Record<string, any>);

  const playerArray = Object.values(playerStats);

  const StatCard = ({ player, index }: { player: any; index: number }) => {
    const shootingPercentage = player.totalShots > 0 ? (player.totalGoals / player.totalShots) * 100 : 0;
    const pointsPerGame = player.totalPoints / player.totalGames;
    const possessionPerGame = Math.floor(player.totalPossession / player.totalGames / 60);

    return (
      <Card key={player.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {player.handle?.charAt(0) || 'P'}
              </div>
              <span>{player.handle || `Player ${index + 1}`}</span>
            </CardTitle>
            <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
              {player.totalGames} game{player.totalGames !== 1 ? 's' : ''}
            </div>
          </div>
          <CardDescription className="text-gray-400 flex items-center space-x-2">
            <span>Team {player.team}</span>
            <span>•</span>
            <span className="text-xs">{player.accountId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Points & Performance */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-blue-900/30 rounded">
              <div className="text-yellow-400 font-bold text-lg">{player.totalPoints}</div>
              <div className="text-blue-300 text-xs">Total Points</div>
            </div>
            <div className="text-center p-2 bg-green-900/30 rounded">
              <div className="text-green-400 font-bold text-lg">{pointsPerGame.toFixed(1)}</div>
              <div className="text-green-300 text-xs">PPG</div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Target className="w-3 h-3 text-green-400" />
                <span className="text-gray-400 text-sm">Goals:</span>
              </div>
              <span className="text-green-400 font-bold">{player.totalGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-gray-400 text-sm">Assists:</span>
              </div>
              <span className="text-blue-400 font-bold">{player.totalAssists}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3 text-purple-400" />
                <span className="text-gray-400 text-sm">Shots:</span>
              </div>
              <span className="text-white font-bold">{player.totalShots}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 text-purple-400" />
                <span className="text-gray-400 text-sm">Shooting %:</span>
              </div>
              <span className="text-purple-400 font-bold">
                {shootingPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-1 text-xs text-center pt-2 border-t border-gray-700">
            <div>
              <div className="text-cyan-400 font-bold">{player.totalPickups}</div>
              <div className="text-gray-400">Pickups</div>
            </div>
            <div>
              <div className="text-orange-400 font-bold">{player.totalPasses}</div>
              <div className="text-gray-400">Passes</div>
            </div>
            <div>
              <div className="text-green-400 font-bold">{possessionPerGame}m</div>
              <div className="text-gray-400">Poss/G</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Player Performance Cards</h3>
        <span className="text-gray-400 text-sm bg-gray-700 px-2 py-1 rounded">
          {playerArray.length} players
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {playerArray.map((player: any, index) => (
          <StatCard key={player.accountId} player={player} index={index} />
        ))}
      </div>
    </div>
  );
};