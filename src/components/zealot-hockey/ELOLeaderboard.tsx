/**
 * Comprehensive ELO leaderboard with per-game rankings
 */

import React, { useState } from 'react';
import { Player, GameType } from '../../types/zealot-hockey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, Crown, TrendingUp, TrendingDown, ChevronDown, Users, Target } from 'lucide-react';
import { Badge } from '../ui/badge';
import { gameTypes } from '../../data/game-types';

interface ELOLeaderboardProps {
  players: Player[];
}

export const ELOLeaderboard: React.FC<ELOLeaderboardProps> = ({ players }) => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [view, setView] = useState<'overall' | 'game'>('overall');

  // Get overall rankings (sorted by overall ELO)
  const overallRankings = [...players].sort((a, b) => b.elo - a.elo);

  // Get game-specific rankings
  const getGameRankings = (gameId: string) => {
    return players
      .map(player => {
        const gameStats = player.gameStats?.[gameId];
        if (!gameStats || gameStats.matchesPlayed === 0) return null;
        
        return {
          ...player,
          gameElo: gameStats.elo,
          gameMatches: gameStats.matchesPlayed,
          gameWins: gameStats.wins,
          gameLosses: gameStats.losses,
          gameWinRate: gameStats.winRate
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.gameElo - a.gameElo);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getEloTrend = (player: any, isGameView: boolean) => {
    const elo = isGameView ? player.gameElo : player.elo;
    if (elo > 1400) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (elo < 1300) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  const renderOverallLeaderboard = () => (
    <div className="space-y-3">
      {overallRankings.map((player, index) => (
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
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="flex items-center space-x-1 justify-end">
                {getEloTrend(player, false)}
                <span className="font-bold text-blue-400">{player.elo}</span>
              </div>
              <div className="text-sm text-gray-400">Overall ELO</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">{player.matchesPlayed}</div>
              <div className="text-sm text-gray-400">Matches</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGameLeaderboard = () => {
    if (!selectedGame) return null;
    
    const gameRankings = getGameRankings(selectedGame.id);
    
    if (gameRankings.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No players have played {selectedGame.name} yet</p>
          <p className="text-sm mt-2">Be the first to start a match!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {gameRankings.map((player: any, index) => (
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
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="flex items-center space-x-1 justify-end">
                  {getEloTrend(player, true)}
                  <span className="font-bold text-blue-400">{player.gameElo}</span>
                </div>
                <div className="text-sm text-gray-400">{selectedGame.name} ELO</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">{player.gameMatches}</div>
                <div className="text-sm text-gray-400">Matches</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-white">ELO Leaderboards</CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <Button
                onClick={() => setView('overall')}
                variant={view === 'overall' ? 'default' : 'ghost'}
                size="sm"
                className={view === 'overall' ? 'bg-blue-600' : 'bg-transparent'}
              >
                <Users className="w-4 h-4 mr-2" />
                Overall
              </Button>
              <Button
                onClick={() => setView('game')}
                variant={view === 'game' ? 'default' : 'ghost'}
                size="sm"
                className={view === 'game' ? 'bg-blue-600' : 'bg-transparent'}
              >
                <Target className="w-4 h-4 mr-2" />
                Per Game
              </Button>
            </div>

            {/* Game Selector (only show in game view) */}
            {view === 'game' && (
              <div className="relative">
                <Button
                  onClick={() => setShowGameSelector(!showGameSelector)}
                  variant="outline"
                  className="bg-transparent border-gray-600 hover:border-blue-500 min-w-[180px] justify-between"
                  size="sm"
                >
                  <div className="flex items-center space-x-2">
                    <span>{selectedGame?.icon || '🎮'}</span>
                    <span>{selectedGame?.name || 'Select Game'}</span>
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
            )}
          </div>
        </div>
        <CardDescription className="text-gray-400">
          {view === 'overall' 
            ? `${players.length} players ranked by overall ELO` 
            : selectedGame 
              ? `${getGameRankings(selectedGame.id).length} players ranked in ${selectedGame.name}`
              : 'Select a game to view rankings'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {view === 'overall' ? renderOverallLeaderboard() : renderGameLeaderboard()}
        
        {/* Quick Stats */}
        {view === 'overall' && (
          <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{overallRankings[0]?.elo || 0}</div>
              <div className="text-sm text-gray-400">Top ELO</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {players.reduce((total, player) => total + player.matchesPlayed, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {(players.reduce((total, player) => total + player.winRate, 0) / players.length).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Avg Win Rate</div>
            </div>
          </div>
        )}
        
        {view === 'game' && selectedGame && (
          <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {getGameRankings(selectedGame.id)[0]?.gameElo || 0}
              </div>
              <div className="text-sm text-gray-400">Top ELO</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {getGameRankings(selectedGame.id).reduce((total: number, player: any) => total + player.gameMatches, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {(getGameRankings(selectedGame.id).reduce((total: number, player: any) => total + player.gameWinRate, 0) / getGameRankings(selectedGame.id).length || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Avg Win Rate</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};