/**
 * Player Stats Sheet Component
 * Displays individual player statistics without Select components
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { HockeyPlayerStats } from '../../types/hockey-stats';

interface PlayerStatsSheetProps {
  player: HockeyPlayerStats;
}

export const PlayerStatsSheet: React.FC<PlayerStatsSheetProps> = ({ player }) => {
  const statSections = [
    {
      title: 'Scoring',
      stats: [
        { label: 'Goals', value: player.goals, color: 'text-yellow-400' },
        { label: 'Assists', value: player.assists, color: 'text-blue-400' },
        { label: 'Points', value: player.points, color: 'text-purple-400' },
        { label: 'Shots', value: player.shots, color: 'text-white' },
        { label: 'Shooting %', value: `${player.shootingPercentage.toFixed(1)}%`, color: 'text-cyan-400' }
      ]
    },
    {
      title: 'Possession',
      stats: [
        { label: 'Steals', value: player.steals, color: 'text-green-400' },
        { label: 'Pickups', value: player.pickups, color: 'text-white' },
        { label: 'Passes', value: player.passes, color: 'text-white' },
        { label: 'Passes Received', value: player.passesReceived, color: 'text-white' },
        { label: 'Pass Completion', value: `${player.passCompletion.toFixed(1)}%`, color: 'text-cyan-400' },
        { label: 'Possession Time', value: `${player.possession}s`, color: 'text-orange-400' }
      ]
    },
    {
      title: 'Goaltending',
      stats: [
        { label: 'Saves', value: player.saves, color: 'text-green-400' },
        { label: 'Shots Allowed', value: player.shotsAllowed, color: 'text-red-400' },
        { label: 'Save %', value: player.savePercentage > 0 ? `${player.savePercentage.toFixed(1)}%` : '-', color: 'text-cyan-400' },
        { label: 'Goaltender Time', value: `${player.goaltenderTime}s`, color: 'text-orange-400' },
        { label: 'Skater Time', value: `${player.skaterTime}s`, color: 'text-orange-400' }
      ]
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">{player.handle}</CardTitle>
            <p className="text-gray-400">
              {player.team} Team • {player.accountId}
            </p>
          </div>
          <Badge className={
            player.team === 'Red' ? 'bg-red-600' : 
            player.team === 'Blue' ? 'bg-blue-600' : 'bg-gray-600'
          }>
            {player.team}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {statSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-600 pb-2">
              {section.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {section.stats.map((stat) => (
                <div key={stat.label} className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Performance Summary */}
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-semibold mb-2">Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Primary Role:</span>
                <span className="text-white">
                  {player.goaltenderTime > player.skaterTime ? 'Goaltender' : 'Skater'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Play Style:</span>
                <span className="text-white">
                  {player.steals > 5 ? 'Defensive' : player.goals > 5 ? 'Offensive' : 'Balanced'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Efficiency:</span>
                <span className="text-white">
                  {player.shootingPercentage > 40 ? 'High' : player.shootingPercentage > 20 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Team Contribution:</span>
                <span className="text-white">
                  {player.assists > player.goals ? 'Playmaker' : 'Scorer'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};