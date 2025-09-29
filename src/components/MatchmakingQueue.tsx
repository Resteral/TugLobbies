
/**
 * Matchmaking Queue Component
 * Handles ELO-based matchmaking for Zealot Hockey players
 */

import { useState, useEffect } from 'react';
import { Search, Clock, Users, Target } from 'lucide-react';
import { Button } from './ui/button';

interface Player {
  id: string;
  name: string;
  elo: number;
  gamesPlayed: number;
  winRate: number;
}

interface Match {
  id: string;
  player1: Player;
  player2: Player;
  estimatedWait: number;
  eloDifference: number;
}

export default function MatchmakingQueue() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [potentialMatches, setPotentialMatches] = useState<Match[]>([]);

  // Mock data - in real implementation, this would come from backend
  const mockPlayers: Player[] = [
    { id: '1', name: 'ProtossPro', elo: 1850, gamesPlayed: 45, winRate: 0.68 },
    { id: '2', name: 'ZealotKing', elo: 1720, gamesPlayed: 32, winRate: 0.55 },
    { id: '3', name: 'HockeyMaster', elo: 1950, gamesPlayed: 67, winRate: 0.72 },
    { id: '4', name: 'SC2Champ', elo: 1680, gamesPlayed: 28, winRate: 0.49 },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime((time) => time + 1);
        // Simulate finding potential matches
        if (searchTime % 5 === 0) {
          const newMatches = generatePotentialMatches(mockPlayers);
          setPotentialMatches(newMatches);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching, searchTime]);

  const generatePotentialMatches = (players: Player[]): Match[] => {
    return players.slice(0, 3).map((player, index) => ({
      id: `match-${index}`,
      player1: player,
      player2: players[(index + 1) % players.length],
      estimatedWait: Math.floor(Math.random() * 30) + 10,
      eloDifference: Math.abs(player.elo - players[(index + 1) % players.length].elo),
    }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSearch = () => {
    setIsSearching(true);
    setSearchTime(0);
    setPotentialMatches(generatePotentialMatches(mockPlayers));
  };

  const handleStopSearch = () => {
    setIsSearching(false);
    setSearchTime(0);
    setPotentialMatches([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Matchmaking Queue</h2>
        <p className="text-gray-400">Find opponents with similar skill level using ELO MMR</p>
      </div>

      {/* Search Status */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${isSearching ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <div>
              <p className="text-lg font-semibold">
                {isSearching ? 'Searching for opponents...' : 'Ready to search'}
              </p>
              <p className="text-gray-400 text-sm">
                {isSearching 
                  ? `Search time: ${formatTime(searchTime)}` 
                  : 'Click start to begin matchmaking'
                }
              </p>
            </div>
          </div>
          <Button
            onClick={isSearching ? handleStopSearch : handleStartSearch}
            className={isSearching ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {isSearching ? 'Stop Search' : 'Start Search'}
          </Button>
        </div>
      </div>

      {/* Potential Matches */}
      {potentialMatches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-400" />
            Potential Matches
          </h3>
          <div className="grid gap-4">
            {potentialMatches.map((match) => (
              <div key={match.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="font-bold text-blue-400">{match.player1.name}</div>
                      <div className="text-sm text-gray-400">ELO: {match.player1.elo}</div>
                    </div>
                    <div className="text-gray-500">vs</div>
                    <div className="text-center">
                      <div className="font-bold text-purple-400">{match.player2.name}</div>
                      <div className="text-sm text-gray-400">ELO: {match.player2.elo}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-400 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      ~{match.estimatedWait}s
                    </div>
                    <div className="text-xs text-gray-500">
                      ELO Diff: {match.eloDifference}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold">24</div>
              <div className="text-sm text-gray-400">Players Online</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Search className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-gray-400">In Queue</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold">45s</div>
              <div className="text-sm text-gray-400">Avg Wait Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
