/**
 * Leaderboard component displaying player rankings
 */

import React from 'react';
import { Player } from '../../types/zealot-hockey';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trophy, Crown, TrendingUp, TrendingDown } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getEloTrend = (player: Player) => {
    // Mock trend calculation - in real app this would use historical data
    if (player.elo > 1400) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (player.elo < 1300) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Player Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                index < 3 
                  ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/50' 
                  : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRankIcon(index + 1)}
                  <span className={`font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-orange-400' : 'text-white'
                  }`}>
                    #{index + 1}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-white">{player.name}</div>
                  <div className="text-sm text-gray-400">
                    {player.wins}W - {player.losses}L ({(player.winRate).toFixed(1)}%)
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1 justify-end">
                    {getEloTrend(player)}
                    <span className="font-bold text-blue-400">{player.elo}</span>
                  </div>
                  <div className="text-sm text-gray-400">ELO</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">{player.matchesPlayed}</div>
                  <div className="text-sm text-gray-400">Matches</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};