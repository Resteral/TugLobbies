/**
 * Player card component displaying player stats and ELO
 */

import React from 'react';
import { Player } from '../../types/zealot-hockey';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trophy, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  rank?: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, rank }) => {
  const getEloTrend = (elo: number) => {
    if (elo > 1200) return 'positive';
    if (elo < 1200) return 'negative';
    return 'neutral';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold">
            {player.name}
          </CardTitle>
          {rank && (
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold">#{rank}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">ELO Rating</span>
          <div className="flex items-center space-x-1">
            {getEloTrend(player.elo) === 'positive' && (
              <TrendingUp className="w-4 h-4 text-green-400" />
            )}
            {getEloTrend(player.elo) === 'negative' && (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`font-bold ${
              getEloTrend(player.elo) === 'positive' ? 'text-green-400' :
              getEloTrend(player.elo) === 'negative' ? 'text-red-400' : 'text-white'
            }`}>
              {player.elo}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Record</span>
          <span className="text-white font-medium">
            {player.wins}W - {player.losses}L
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Win Rate</span>
          <span className="text-white font-medium">
            {player.winRate}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Matches</span>
          <span className="text-white font-medium">
            {player.matchesPlayed}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Last Played</span>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-gray-300 text-sm">
              {formatDate(player.lastPlayed)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};