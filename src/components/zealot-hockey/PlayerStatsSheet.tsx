/**
 * Individual player statistics spreadsheet component
 */

import React from 'react';
import { HockeyPlayerStats } from '../../types/hockey-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Target, Users, Clock, Zap, Shield, TrendingUp } from 'lucide-react';

interface PlayerStatsSheetProps {
  playerStats: HockeyPlayerStats[];
  accountId: string;
}

export const PlayerStatsSheet: React.FC<PlayerStatsSheetProps> = ({ 
  playerStats, 
  accountId 
}) => {
  const playerGames = playerStats.filter(stat => stat.accountId === accountId);
  
  if (playerGames.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Statistics Found</h3>
          <p className="text-gray-400">No game data found for account ID: {accountId}</p>
        </CardContent>
      </Card>
    );
  }

  const player = playerGames[0]; // Use first game for player info
  const totalGames = playerGames.length;
  
  // Calculate cumulative stats
  const cumulativeStats = playerGames.reduce((acc, game) => ({
    goals: acc.goals + game.goals,
    assists: acc.assists + game.assists,
    shots: acc.shots + game.shots,
    pickups: acc.pickups + game.pickups,
    passes: acc.passes + game.passes,
    passesReceived: acc.passesReceived + game.passesReceived,
    possession: acc.possession + game.possession,
    shotsAllowed: acc.shotsAllowed + game.shotsAllowed,
    saves: acc.saves + game.saves,
    goaltenderTime: acc.goaltenderTime + game.goaltenderTime,
    skaterTime: acc.skaterTime + game.skaterTime
  }), {
    goals: 0, assists: 0, shots: 0, pickups: 0, passes: 0, 
    passesReceived: 0, possession: 0, shotsAllowed: 0, saves: 0,
    goaltenderTime: 0, skaterTime: 0
  });

  // Calculate averages and percentages
  const averageStats = {
    goals: cumulativeStats.goals / totalGames,
    assists: cumulativeStats.assists / totalGames,
    shots: cumulativeStats.shots / totalGames,
    shootingPercentage: cumulativeStats.shots > 0 ? (cumulativeStats.goals / cumulativeStats.shots) * 100 : 0,
    passCompletion: cumulativeStats.passes > 0 ? (cumulativeStats.passesReceived / cumulativeStats.passes) * 100 : 0,
    savePercentage: cumulativeStats.shotsAllowed > 0 ? (cumulativeStats.saves / cumulativeStats.shotsAllowed) * 100 : 0,
    points: cumulativeStats.goals + cumulativeStats.assists,
    pointsPerGame: (cumulativeStats.goals + cumulativeStats.assists) / totalGames
  };

  const totalTime = cumulativeStats.goaltenderTime + cumulativeStats.skaterTime;
  const possessionPercentage = totalTime > 0 ? (cumulativeStats.possession / totalTime) * 100 : 0;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: { 
    icon: any; 
    title: string; 
    value: string | number; 
    subtitle?: string;
    color?: 'blue' | 'green' | 'yellow' | 'purple';
  }) => {
    const colorClasses = {
      blue: 'from-blue-900/50 to-blue-800/30 border-blue-600 text-blue-400',
      green: 'from-green-900/50 to-green-800/30 border-green-600 text-green-400',
      yellow: 'from-yellow-900/50 to-yellow-800/30 border-yellow-600 text-yellow-400',
      purple: 'from-purple-900/50 to-purple-800/30 border-purple-600 text-purple-400'
    };

    return (
      <Card className={`bg-gradient-to-br ${colorClasses[color]} border`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Icon className="w-8 h-8" />
            <div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm font-medium">{title}</div>
              {subtitle && <div className="text-xs opacity-75">{subtitle}</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" id={`player-stats-${accountId}`}>
      {/* Player Header */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-2xl flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {player.handle?.charAt(0) || 'P'}
                </div>
                <div>
                  <div>{player.handle || 'Unknown Player'}</div>
                  <CardDescription className="text-gray-400 text-lg">
                    Account ID: {accountId} • Team: {player.team}
                  </CardDescription>
                </div>
              </CardTitle>
            </div>
            <Badge variant="default" className="bg-green-600 text-lg px-3 py-1">
              {totalGames} Game{totalGames !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Trophy}
          title="Total Points"
          value={averageStats.points}
          subtitle={`${averageStats.pointsPerGame.toFixed(1)} per game`}
          color="yellow"
        />
        <StatCard 
          icon={Target}
          title="Shooting %"
          value={`${averageStats.shootingPercentage.toFixed(1)}%`}
          subtitle={`${cumulativeStats.goals}G / ${cumulativeStats.shots}S`}
          color="green"
        />
        <StatCard 
          icon={Zap}
          title="Pass Completion"
          value={`${averageStats.passCompletion.toFixed(1)}%`}
          subtitle={`${cumulativeStats.passesReceived}R / ${cumulativeStats.passes}P`}
          color="blue"
        />
        <StatCard 
          icon={Shield}
          title="Possession %"
          value={`${possessionPercentage.toFixed(1)}%`}
          subtitle={`${Math.floor(cumulativeStats.possession / 60)}m total`}
          color="purple"
        />
      </div>

      {/* Detailed Statistics Table */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Detailed Game Statistics</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Comprehensive breakdown of performance across all games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-gray-400 font-semibold">Statistic</th>
                  <th className="text-right p-3 text-gray-400 font-semibold">Total</th>
                  <th className="text-right p-3 text-gray-400 font-semibold">Per Game</th>
                  <th className="text-right p-3 text-gray-400 font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-white font-medium">Goals</td>
                  <td className="p-3 text-right text-green-400 font-bold">{cumulativeStats.goals}</td>
                  <td className="p-3 text-right text-gray-300">{averageStats.goals.toFixed(1)}</td>
                  <td className="p-3 text-right text-blue-400">{averageStats.shootingPercentage.toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-white font-medium">Assists</td>
                  <td className="p-3 text-right text-green-400 font-bold">{cumulativeStats.assists}</td>
                  <td className="p-3 text-right text-gray-300">{averageStats.assists.toFixed(1)}</td>
                  <td className="p-3 text-right text-blue-400">-</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-white font-medium">Shots</td>
                  <td className="p-3 text-right text-yellow-400 font-bold">{cumulativeStats.shots}</td>
                  <td className="p-3 text-right text-gray-300">{averageStats.shots.toFixed(1)}</td>
                  <td className="p-3 text-right text-blue-400">{averageStats.shootingPercentage.toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-white font-medium">Pickups</td>
                  <td className="p-3 text-right text-purple-400 font-bold">{cumulativeStats.pickups}</td>
                  <td className="p-3 text-right text-gray-300">{(cumulativeStats.pickups / totalGames).toFixed(1)}</td>
                  <td className="p-3 text-right text-blue-400">-</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-white font-medium">Passes</td>
                  <td className="p-3 text-right text-blue-400 font-bold">{cumulativeStats.passes}</td>
                  <td className="p-3 text-right text-gray-300">{(cumulativeStats.passes / totalGames).toFixed(1)}</td>
                  <td className="p-3 text-right text-green-400">{averageStats.passCompletion.toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 text-white font-medium">Saves</td>
                  <td className="p-3 text-right text-green-400 font-bold">{cumulativeStats.saves}</td>
                  <td className="p-3 text-right text-gray-300">{(cumulativeStats.saves / totalGames).toFixed(1)}</td>
                  <td className="p-3 text-right text-blue-400">{averageStats.savePercentage.toFixed(1)}%</td>
                </tr>
                <tr className="hover:bg-gray-800/50">
                  <td className="p-3 text-white font-medium">Possession Time</td>
                  <td className="p-3 text-right text-purple-400 font-bold">
                    {Math.floor(cumulativeStats.possession / 60)}m {cumulativeStats.possession % 60}s
                  </td>
                  <td className="p-3 text-right text-gray-300">
                    {Math.floor((cumulativeStats.possession / totalGames) / 60)}m {Math.floor((cumulativeStats.possession / totalGames) % 60)}s
                  </td>
                  <td className="p-3 text-right text-blue-400">{possessionPercentage.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Game-by-Game Breakdown */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Game-by-Game Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2 text-gray-400">Game</th>
                  <th className="text-right p-2 text-gray-400">Team</th>
                  <th className="text-right p-2 text-gray-400">G</th>
                  <th className="text-right p-2 text-gray-400">A</th>
                  <th className="text-right p-2 text-gray-400">PTS</th>
                  <th className="text-right p-2 text-gray-400">SHT</th>
                  <th className="text-right p-2 text-gray-400">SHT%</th>
                  <th className="text-right p-2 text-gray-400">PICK</th>
                  <th className="text-right p-2 text-gray-400">PASS%</th>
                  <th className="text-right p-2 text-gray-400">POS</th>
                </tr>
              </thead>
              <tbody>
                {playerGames.map((game, index) => (
                  <tr key={game.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-2 text-white font-medium">Game {index + 1}</td>
                    <td className="p-2 text-right text-gray-400">{game.team}</td>
                    <td className="p-2 text-right text-green-400">{game.goals}</td>
                    <td className="p-2 text-right text-blue-400">{game.assists}</td>
                    <td className="p-2 text-right text-yellow-400 font-bold">{game.points || game.goals + game.assists}</td>
                    <td className="p-2 text-right text-white">{game.shots}</td>
                    <td className="p-2 text-right text-purple-400">
                      {game.shootingPercentage ? game.shootingPercentage.toFixed(1) : 
                       (game.shots > 0 ? ((game.goals / game.shots) * 100).toFixed(1) : 0)}%
                    </td>
                    <td className="p-2 text-right text-white">{game.pickups}</td>
                    <td className="p-2 text-right text-cyan-400">
                      {game.passCompletion ? game.passCompletion.toFixed(1) :
                       (game.passes > 0 ? ((game.passesReceived / game.passes) * 100).toFixed(1) : 0)}%
                    </td>
                    <td className="p-2 text-right text-orange-400">
                      {Math.floor(game.possession / 60)}m {game.possession % 60}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
