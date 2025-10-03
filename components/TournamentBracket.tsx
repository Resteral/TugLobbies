/**
 * Tournament bracket visualization component
 */

import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Crown, Play, Clock } from 'lucide-react';

export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  player1: { id: string; name: string; score?: number };
  player2: { id: string; name: string; score?: number };
  winner?: string;
  status: 'scheduled' | 'live' | 'completed';
  startTime?: string;
}

export interface BracketRound {
  round: number;
  name: string;
  matches: BracketMatch[];
}

interface TournamentBracketProps {
  rounds: BracketRound[];
  format: 'single-elimination' | 'double-elimination';
  className?: string;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  rounds, 
  format, 
  className = '' 
}) => {
  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'scheduled': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getMatchStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'Live';
      case 'completed': return 'Completed';
      case 'scheduled': return 'Scheduled';
      default: return status;
    }
  };

  const renderMatch = (match: BracketMatch) => (
    <Card key={match.id} className={`bg-slate-800 border-slate-700 min-w-[200px] ${
      match.status === 'live' ? 'border-green-500 ring-2 ring-green-500/20' : ''
    }`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getMatchStatusColor(match.status)}>
            {getMatchStatusText(match.status)}
          </Badge>
          {match.status === 'live' && (
            <div className="flex items-center text-green-400 text-xs">
              <Play className="w-3 h-3 mr-1 animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        <div className="space-y-1">
          {/* Player 1 */}
          <div className={`flex items-center justify-between p-1 px-2 rounded text-sm ${
            match.winner === match.player1.id ? 'bg-green-900/30 border border-green-500/50' :
            match.status === 'live' ? 'bg-blue-900/20' : 'bg-slate-700/50'
          }`}>
            <div className="flex items-center space-x-1">
              <span className="text-white">{match.player1.name}</span>
              {match.winner === match.player1.id && <Crown className="w-3 h-3 text-yellow-400" />}
            </div>
            {match.player1.score !== undefined && (
              <span className="text-white font-bold">{match.player1.score}</span>
            )}
          </div>

          {/* Player 2 */}
          <div className={`flex items-center justify-between p-1 px-2 rounded text-sm ${
            match.winner === match.player2.id ? 'bg-green-900/30 border border-green-500/50' :
            match.status === 'live' ? 'bg-blue-900/20' : 'bg-slate-700/50'
          }`}>
            <div className="flex items-center space-x-1">
              <span className="text-white">{match.player2.name}</span>
              {match.winner === match.player2.id && <Crown className="w-3 h-3 text-yellow-400" />}
            </div>
            {match.player2.score !== undefined && (
              <span className="text-white font-bold">{match.player2.score}</span>
            )}
          </div>
        </div>

        {match.startTime && (
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(match.startTime).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderRound = (round: BracketRound, index: number) => (
    <div key={round.round} className="flex flex-col items-center space-y-4">
      <h3 className="text-white font-semibold text-sm">{round.name}</h3>
      <div className="flex flex-col space-y-4">
        {round.matches.map(renderMatch)}
      </div>
    </div>
  );

  return (
    <div className={`flex space-x-6 overflow-x-auto py-4 ${className}`}>
      {rounds.map(renderRound)}
    </div>
  );
};

export default TournamentBracket;