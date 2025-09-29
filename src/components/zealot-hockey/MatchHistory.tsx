/**
 * Match history component displaying recent matches
 */

import React from 'react';
import { Match } from '../../types/zealot-hockey';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trophy, Clock, MapPin } from 'lucide-react';

interface MatchHistoryProps {
  matches: Match[];
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ matches }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Recent Matches</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {matches.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No matches recorded yet
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-semibold ${
                      match.winnerId === match.player1Id ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {match.player1Name}
                    </span>
                    <span className="text-gray-400">vs</span>
                    <span className={`font-semibold ${
                      match.winnerId === match.player2Id ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {match.player2Name}
                    </span>
                  </div>
                  
                  {match.replayData && (
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(match.replayData.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{match.replayData.map}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">
                    {formatDate(match.date)}
                  </div>
                  <div className="flex space-x-2 text-xs">
                    <span className={match.player1EloChange > 0 ? 'text-green-400' : 'text-red-400'}>
                      {match.player1EloChange > 0 ? '+' : ''}{match.player1EloChange}
                    </span>
                    <span className={match.player2EloChange > 0 ? 'text-green-400' : 'text-red-400'}>
                      {match.player2EloChange > 0 ? '+' : ''}{match.player2EloChange}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};