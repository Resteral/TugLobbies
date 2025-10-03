/**
 * Hockey Leaderboard Component
 * Displays player statistics in a leaderboard format
 */

import React from 'react';
import { HockeyPlayerStats } from '../../types/hockey-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Trophy, Target } from 'lucide-react';

interface HockeyLeaderboardProps {
  stats: HockeyPlayerStats[];
}

export const HockeyLeaderboard: React.FC<HockeyLeaderboardProps> = ({ stats }) => {
  // Sort players by points descending
  const sortedStats = [...stats].sort((a, b) => b.points - a.points);

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Player Leaderboard</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Top performers sorted by total points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Goals
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Assists
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Steals
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Shots
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  SHT%
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Saves
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  SV%
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {sortedStats.map((player, index) => (
                <tr key={player.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-400 mr-2" />}
                      <span className={index < 3 ? "font-bold text-yellow-400" : "text-white"}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-white font-medium">{player.handle}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={
                      player.team === 'Red' ? 'text-red-400' : 
                      player.team === 'Blue' ? 'text-blue-400' : 'text-gray-400'
                    }>
                      {player.team}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-yellow-400 font-bold">{player.goals}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-blue-400 font-bold">{player.assists}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-purple-400 font-bold">{player.points}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-green-400 font-bold">{player.steals}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-white">{player.shots}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-cyan-400">{player.shootingPercentage.toFixed(1)}%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-green-400 font-bold">{player.saves}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-cyan-400">
                    {player.savePercentage > 0 ? `${player.savePercentage.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedStats.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No player statistics available</p>
            <p className="text-sm">Import data to see the leaderboard</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};