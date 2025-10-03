/**
 * Game Leaderboard Component for Zealot Hockey
 * Displays recent game results and match history
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Trophy, Clock, Users, ChevronDown, TrendingUp, Target } from 'lucide-react';

interface GameResult {
  id: string;
  date: string;
  gameType: string;
  players: {
    team1: string[];
    team2: string[];
  };
  score: {
    team1: number;
    team2: number;
  };
  duration: string;
  winner: 'team1' | 'team2';
}

export const GameLeaderboard: React.FC = () => {
  const [selectedGameType, setSelectedGameType] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');
  const [showGameTypeDropdown, setShowGameTypeDropdown] = useState(false);
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);

  const gameTypes = [
    { value: 'all', label: 'All Games' },
    { value: '1v1', label: '1v1' },
    { value: '2v2', label: '2v2' },
    { value: '3v3', label: '3v3' },
    { value: '4v4', label: '4v4' }
  ];

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const mockGames: GameResult[] = [
    {
      id: '1',
      date: '2024-01-15 14:30',
      gameType: '1v1',
      players: {
        team1: ['ProPlayer1'],
        team2: ['ZealotMaster']
      },
      score: { team1: 3, team2: 2 },
      duration: '12:45',
      winner: 'team1'
    },
    {
      id: '2',
      date: '2024-01-15 13:15',
      gameType: '2v2',
      players: {
        team1: ['HockeyChamp', 'StarCraftPro'],
        team2: ['RushPlayer', 'MicroMaster']
      },
      score: { team1: 5, team2: 1 },
      duration: '15:20',
      winner: 'team1'
    },
    {
      id: '3',
      date: '2024-01-15 12:00',
      gameType: '1v1',
      players: {
        team1: ['BuildOrderPro'],
        team2: ['ZealotRush']
      },
      score: { team1: 2, team2: 4 },
      duration: '18:30',
      winner: 'team2'
    },
    {
      id: '4',
      date: '2024-01-15 11:45',
      gameType: '3v3',
      players: {
        team1: ['TeamPlayer1', 'TeamPlayer2', 'TeamPlayer3'],
        team2: ['SquadAlpha', 'SquadBeta', 'SquadGamma']
      },
      score: { team1: 6, team2: 3 },
      duration: '22:15',
      winner: 'team1'
    }
  ];

  const handleGameTypeChange = (value: string) => {
    setSelectedGameType(value);
    setShowGameTypeDropdown(false);
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
    setShowTimeRangeDropdown(false);
  };

  const getWinnerBadge = (game: GameResult, team: 'team1' | 'team2') => {
    return game.winner === team ? (
      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 ml-2">
        Winner
      </Badge>
    ) : null;
  };

  const getScoreColor = (game: GameResult, team: 'team1' | 'team2') => {
    return game.winner === team ? 'text-green-400 font-bold' : 'text-red-400';
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-700 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>Recent Games</div>
              <p className="text-blue-200">
                Latest match results and statistics
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Game Type Filter */}
            <div className="relative">
              <Button
                variant="outline"
                className="bg-transparent border-blue-600 text-blue-300 hover:bg-blue-700"
                onClick={() => setShowGameTypeDropdown(!showGameTypeDropdown)}
              >
                {gameTypes.find(type => type.value === selectedGameType)?.label}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showGameTypeDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-blue-800 border border-blue-600 rounded-lg shadow-lg z-20">
                  {gameTypes.map((type) => (
                    <div
                      key={type.value}
                      className="px-4 py-2 hover:bg-blue-700 cursor-pointer text-blue-300"
                      onClick={() => {
                        handleGameTypeChange(type.value);
                        setShowGameTypeDropdown(false);
                      }}
                    >
                      {type.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Time Range Filter */}
            <div className="relative">
              <Button
                variant="outline"
                className="bg-transparent border-cyan-600 text-cyan-300 hover:bg-cyan-700"
                onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
              >
                {timeRanges.find(range => range.value === selectedTimeRange)?.label}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showTimeRangeDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-cyan-800 border border-cyan-600 rounded-lg shadow-lg z-10">
                  {timeRanges.map((range) => (
                    <div
                      key={range.value}
                      className="px-4 py-2 hover:bg-cyan-700 cursor-pointer text-cyan-300"
                      onClick={() => {
                        handleTimeRangeChange(range.value);
                        setShowTimeRangeDropdown(false);
                      }}
                    >
                      {range.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Games List */}
        <div className="space-y-3">
          {mockGames.map((game) => (
            <div
              key={game.id}
              className="p-4 rounded-lg bg-blue-800/30 border border-blue-700/50 hover:bg-blue-700/30 transition-colors"
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-transparent border-blue-600 text-blue-300">
                    {game.gameType}
                  </Badge>
                  <div className="text-blue-300 text-sm">{game.date}</div>
                </div>
                <div className="flex items-center space-x-2 text-blue-300 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{game.duration}</span>
                </div>
              </div>

              {/* Teams and Score */}
              <div className="grid grid-cols-2 gap-6">
                {/* Team 1 */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-blue-300" />
                    <div className="text-white font-semibold">
                      Team 1
                    </div>
                    {getWinnerBadge(game, 'team1')}
                  </div>
                  <div className="space-y-1">
                    {game.players.team1.map((player, index) => (
                      <div key={index} className="text-blue-200 text-sm">
                        {player}
                      </div>
                    ))}
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${getScoreColor(game, 'team1')}`}>
                    {game.score.team1}
                  </div>
                </div>

                {/* VS Separator */}
                <div className="flex items-center justify-center">
                  <div className="text-blue-400 font-bold text-lg">VS</div>
                </div>

                {/* Team 2 */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-blue-300" />
                    <div className="text-white font-semibold">
                      Team 2
                    </div>
                    {getWinnerBadge(game, 'team2')}
                  </div>
                  <div className="space-y-1">
                    {game.players.team2.map((player, index) => (
                      <div key={index} className="text-blue-200 text-sm">
                        {player}
                      </div>
                    ))}
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${getScoreColor(game, 'team2')}`}>
                    {game.score.team2}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-blue-700/50">
          <div className="text-center p-3 bg-blue-800/30 rounded-lg">
            <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-white font-bold text-lg">{mockGames.length}</div>
            <div className="text-blue-300 text-sm">Total Games</div>
          </div>
          <div className="text-center p-3 bg-blue-800/30 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-white font-bold text-lg">
              {Math.round(mockGames.reduce((acc, game) => acc + parseInt(game.duration.split(':')[0]), 0) / mockGames.length)}m
            </div>
            <div className="text-blue-300 text-sm">Avg Duration</div>
          </div>
          <div className="text-center p-3 bg-blue-800/30 rounded-lg">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-white font-bold text-lg">
              {mockGames.filter(game => game.winner === 'team1').length}
            </div>
            <div className="text-blue-300 text-sm">Team 1 Wins</div>
          </div>
          <div className="text-center p-3 bg-blue-800/30 rounded-lg">
            <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-white font-bold text-lg">
              {mockGames.reduce((acc, game) => acc + game.players.team1.length + game.players.team2.length, 0)}
            </div>
            <div className="text-blue-300 text-sm">Total Players</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};