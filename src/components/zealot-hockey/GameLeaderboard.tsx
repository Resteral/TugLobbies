/**
 * Per-game leaderboard component
 */

import React, { useState } from 'react';
import { Player, GameType } from '../../types/zealot-hockey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, Crown, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { gameTypes } from '../../data/game-types';

interface GameLeaderboardProps {
  players: Player[];
}

export const GameLeaderboard: React.FC<GameLeaderboardProps> = ({ players }) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(gameTypes[0]);
  const [showGameSelector, setShowGameSelector] = useState(false);

  // Filter players for the selected game and calculate their stats
  const getPlayersForGame = () => {
    return players.map(player => {
      const gameStats = player.gameStats?.[selectedGame.id] || {
        elo: 1200,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        lastPlayed: new Date()
      };

      return {
        ...player,
        gameElo: gameStats.elo,
        gameMatches: gameStats.matchesPlayed,
        gameWins: gameStats.wins,
        gameLosses: gameStats.losses,
        gameWinRate: gameStats.winRate
      };
    }).filter(player => player.gameMatches > 0) // Only show players who have played this game
      .sort((a, b) => b.gameElo - a.gameElo);
  };

  const gamePlayers = getPlayersForGame();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getEloTrend = (player: any) => {
    // Mock trend calculation - in real app this would use historical data
    if (player.gameElo > 1400) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (player.gameElo < 1300) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-white">Game Leaderboards</CardTitle>
          </div>
          
          {/* Game Selector */}
          <div className="relative">
            <Button
              onClick={() => setShowGameSelector(!showGameSelector)}
              variant="outline"
              className="bg-transparent border-gray-600 hover:border-blue-500 min-w-[200px] justify-between"
              size="sm"
            >
              <div className="flex items-center space-x-2">
                <span>{selectedGame.icon}</span>
                <span>{selectedGame.name}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
            
            {showGameSelector && (
              <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {gameTypes.map(game => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setSelectedGame(game);
                      setShowGameSelector(false);
                    }}
                    className="w-full p-3 text-left hover:bg-gray-700 border-b border-gray-700 last:border-b-0 flex items-center space-x-3"
                  >
                    <span className="text-lg">{game.icon}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium">{game.name}</div>
                      <div className="text-gray-400 text-sm">{game.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <CardDescription className="text-gray-400">
          {gamePlayers.length} players ranked in {selectedGame.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {gamePlayers.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No players have played {selectedGame.name} yet</p>
            <p className="text-sm mt-2">Be the first to start a match!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {gamePlayers.map((player, index) => (
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
                      {player.gameWins}W - {player.gameLosses}L ({(player.gameWinRate).toFixed(1)}%)
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 justify-end">
                      {getEloTrend(player)}
                      <span className="font-bold text-blue-400">{player.gameElo}</span>
                    </div>
                    <div className="text-sm text-gray-400">ELO</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{player.gameMatches}</div>
                    <div className="text-sm text-gray-400">Matches</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Quick Stats */}
        {gamePlayers.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{gamePlayers[0]?.gameElo || 0}</div>
              <div className="text-sm text-gray-400">Top ELO</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {gamePlayers.reduce((total, player) => total + player.gameMatches, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {(gamePlayers.reduce((total, player) => total + player.gameWinRate, 0) / gamePlayers.length).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Avg Win Rate</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};