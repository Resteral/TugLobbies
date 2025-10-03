/**
 * Game Stats Aggregator Component
 * Aggregates and displays matchmaking game statistics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Target, Trophy, Clock, TrendingUp } from 'lucide-react';

export const GameStatsAggregator: React.FC = () => {
  const [gameStats, setGameStats] = useState({
    totalMatches: 0,
    activePlayers: 0,
    averageGoals: 0,
    topScorer: '',
    recentActivity: []
  });

  // Mock data - in real implementation, this would come from your matchmaking system
  useEffect(() => {
    setGameStats({
      totalMatches: 42,
      activePlayers: 28,
      averageGoals: 3.2,
      topScorer: 'ZealotMaster (15 goals)',
      recentActivity: [
        { player: 'Player1', action: 'joined queue', time: '2 min ago' },
        { player: 'Player2', action: 'completed match', time: '5 min ago' },
        { player: 'Player3', action: 'left queue', time: '8 min ago' }
      ]
    });
  }, []);

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>Matchmaking Statistics</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Live statistics from active matchmaking games
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-600">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{gameStats.activePlayers}</div>
            <div className="text-blue-300 text-sm">Active Players</div>
          </div>
          <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-600">
            <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{gameStats.totalMatches}</div>
            <div className="text-green-300 text-sm">Total Matches</div>
          </div>
          <div className="text-center p-4 bg-yellow-900/30 rounded-lg border border-yellow-600">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{gameStats.averageGoals}</div>
            <div className="text-yellow-300 text-sm">Avg Goals</div>
          </div>
          <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-600">
            <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">12:34</div>
            <div className="text-purple-300 text-sm">Avg Game Time</div>
          </div>
        </div>

        {/* Top Performer */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <h3 className="text-white font-semibold mb-2 flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Top Scorer</span>
          </h3>
          <p className="text-yellow-400 font-bold">{gameStats.topScorer}</p>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Recent Activity</span>
          </h3>
          <div className="space-y-2">
            {gameStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                <span className="text-white text-sm">{activity.player}</span>
                <Badge variant="outline" className="bg-transparent text-xs">
                  {activity.action}
                </Badge>
                <span className="text-gray-400 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Detailed Stats
          </Button>
          <Button variant="outline" className="bg-transparent border-green-600 text-green-400 hover:bg-green-600">
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};