/**
 * ELO Leaderboard Component for Zealot Hockey
 * Displays player rankings with ELO-based sorting
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Trophy, Crown, TrendingUp, Users, ChevronDown } from 'lucide-react';

interface PlayerELO {
  id: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  lastPlayed: string;
}

export const ELOLeaderboard: React.FC = () => {
  const [players, setPlayers] = useState<PlayerELO[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<string>('all');
  const [showGameTypeDropdown, setShowGameTypeDropdown] = useState(false);

  const gameTypes = [
    { value: 'all', label: 'All Games' },
    { value: '1v1', label: '1v1' },
    { value: '2v2', label: '2v2' },
    { value: '3v3', label: '3v3' },
    { value: '4v4', label: '4v4' }
  ];

  useEffect(() => {
    // Mock data for demonstration
    const mockPlayers: PlayerELO[] = [
      {
        id: '1',
        name: 'ProPlayer1',
        elo: 2450,
        wins: 156,
        losses: 42,
        winRate: 78.8,
        streak: 8,
        lastPlayed: '2024-01-15'
      },
      {
        id: '2',
        name: 'ZealotMaster',
        elo: 2380,
        wins: 203,
        losses: 89,
        winRate: 69.5,
        streak: 3,
        lastPlayed: '2024-01-15'
      },
      {
        id: '3',
        name: 'HockeyChamp',
        elo: 2310,
        wins: 178,
        losses: 76,
        winRate: 70.1,
        streak: -1,
        lastPlayed: '2024-01-14'
      },
      {
        id: '4',
        name: 'StarCraftPro',
        elo: 2250,
        wins: 134,
        losses: 67,
        winRate: 66.7,
        streak: 5,
        lastPlayed: '2024-01-14'
      },
      {
        id: '5',
        name: 'RushPlayer',
        elo: 2190,
        wins: 98,
        losses: 45,
        winRate: 68.5,
        streak: 2,
        lastPlayed: '2024-01-13'
      }
    ];
    setPlayers(mockPlayers);
  }, []);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Trophy className="w-5 h-5 text-gray-300" />;
      case 2:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">{index + 1}</div>;
    }
  };

  const getELOColor = (elo: number) => {
    if (elo >= 2400) return 'text-purple-400';
    if (elo >= 2200) return 'text-red-400';
    if (elo >= 2000) return 'text-orange-400';
    if (elo >= 1800) return 'text-yellow-400';
    if (elo >= 1600) return 'text-green-400';
    return 'text-blue-400';
  };

  const getStreakColor = (streak: number) => {
    if (streak > 0) return 'text-green-400';
    if (streak < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const handleGameTypeChange = (value: string) => {
    setSelectedGameType(value);
    setShowGameTypeDropdown(false);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>ELO Leaderboard</div>
              <p className="text-slate-300">
                Competitive player rankings based on ELO system
              </p>
            </div>
          </div>
          
          {/* Game Type Filter Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => setShowGameTypeDropdown(!showGameTypeDropdown)}
            >
              {gameTypes.find(type => type.value === selectedGameType)?.label}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            
            {showGameTypeDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10">
                {gameTypes.map((type) => (
                  <div
                    key={type.value}
                    className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-gray-300"
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
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Leaderboard Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-slate-700">
          <div className="col-span-1">Rank</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-2 text-center">ELO</div>
          <div className="col-span-2 text-center">Record</div>
          <div className="col-span-2 text-center">Win Rate</div>
          <div className="col-span-2 text-center">Streak</div>
        </div>

        {/* Players List */}
        <div className="space-y-2">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center justify-center">
                {getRankBadge(index)}
              </div>

              {/* Player Name */}
              <div className="col-span-3">
                <div className="font-medium text-white">{player.name}</div>
                <div className="text-xs text-gray-400">
                  Last played: {player.lastPlayed}
                </div>
              </div>

              {/* ELO */}
              <div className="col-span-2 text-center">
                <div className={`text-lg font-bold ${getELOColor(player.elo)}`}>
                  {player.elo}
                </div>
              </div>

              {/* Record */}
              <div className="col-span-2 text-center">
                <div className="text-white">
                  {player.wins}-{player.losses}
                </div>
                <div className="text-xs text-gray-400">
                  {player.wins + player.losses} games
                </div>
              </div>

              {/* Win Rate */}
              <div className="col-span-2 text-center">
                <div className="text-green-400 font-semibold">
                  {player.winRate}%
                </div>
              </div>

              {/* Streak */}
              <div className="col-span-2 text-center">
                <div className={`font-semibold ${getStreakColor(player.streak)}`}>
                  {player.streak > 0 ? `+${player.streak}` : player.streak}
                </div>
                <div className="text-xs text-gray-400">
                  {player.streak > 0 ? 'Winning' : player.streak < 0 ? 'Losing' : 'Neutral'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
          <div className="text-center p-4 bg-slate-800/30 rounded-lg">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-white font-semibold">{players.length}</div>
            <div className="text-gray-400 text-sm">Active Players</div>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-white font-semibold">
              {players.reduce((acc, player) => acc + player.wins, 0)}
            </div>
            <div className="text-gray-400 text-sm">Total Wins</div>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-lg">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <div className="text-white font-semibold">
              {Math.round(players.reduce((acc, player) => acc + player.elo, 0) / players.length)}
            </div>
            <div className="text-gray-400 text-sm">Average ELO</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};