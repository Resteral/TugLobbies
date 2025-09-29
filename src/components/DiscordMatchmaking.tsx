/**
 * Discord Bot Matchmaking Component
 * Handles 4v4 lobby search and matchmaking through Discord bot
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Users, Clock, CheckCircle, XCircle, Play, UserPlus } from 'lucide-react';

interface MatchmakingPlayer {
  id: string;
  name: string;
  elo: number;
  ready: boolean;
  joinedAt: Date;
}

interface MatchmakingLobby {
  id: string;
  name: string;
  gameType: string;
  players: MatchmakingPlayer[];
  status: 'searching' | 'forming' | 'ready' | 'matched';
  createdBy: string;
  createdAt: Date;
  teamSize: 4;
  averageElo: number;
}

export const DiscordMatchmaking: React.FC = () => {
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [currentLobby, setCurrentLobby] = useState<MatchmakingLobby | null>(null);
  const [availableLobbies, setAvailableLobbies] = useState<MatchmakingLobby[]>([]);
  const [matchFound, setMatchFound] = useState(false);

  // Mock data for available lobbies
  const mockLobbies: MatchmakingLobby[] = [
    {
      id: 'lobby-1',
      name: 'Competitive 4v4',
      gameType: '4v4-hockey',
      players: [
        { id: '1', name: 'ZealotMaster', elo: 1450, ready: true, joinedAt: new Date() },
        { id: '2', name: 'HockeyPro', elo: 1380, ready: true, joinedAt: new Date() },
        { id: '3', name: 'SC2Champ', elo: 1420, ready: true, joinedAt: new Date() },
      ],
      status: 'forming',
      createdBy: 'ZealotMaster',
      createdAt: new Date(),
      teamSize: 4,
      averageElo: 1417
    },
    {
      id: 'lobby-2',
      name: 'Casual 4v4',
      gameType: '4v4-hockey',
      players: [
        { id: '4', name: 'BeginnerPlayer', elo: 1200, ready: true, joinedAt: new Date() },
        { id: '5', name: 'Newbie', elo: 1250, ready: true, joinedAt: new Date() },
      ],
      status: 'searching',
      createdBy: 'BeginnerPlayer',
      createdAt: new Date(),
      teamSize: 4,
      averageElo: 1225
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (searching) {
      setAvailableLobbies(mockLobbies);
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
        
        // Simulate finding matches
        if (searchTime % 10 === 0 && !currentLobby) {
          const bestMatch = mockLobbies.find(lobby => 
            lobby.players.length < 4 && lobby.status === 'searching'
          );
          if (bestMatch) {
            setCurrentLobby(bestMatch);
          }
        }
        
        // Simulate match found
        if (searchTime > 30 && !matchFound) {
          setMatchFound(true);
          setSearching(false);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [searching, searchTime, currentLobby, matchFound]);

  const startMatchmaking = () => {
    setSearching(true);
    setSearchTime(0);
    setMatchFound(false);
    setCurrentLobby(null);
  };

  const stopMatchmaking = () => {
    setSearching(false);
    setSearchTime(0);
    setCurrentLobby(null);
  };

  const joinLobby = (lobbyId: string) => {
    const lobby = availableLobbies.find(l => l.id === lobbyId);
    if (lobby) {
      setCurrentLobby(lobby);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'searching': return 'text-yellow-400';
      case 'forming': return 'text-blue-400';
      case 'ready': return 'text-green-400';
      case 'matched': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'searching': return <Search className="w-4 h-4" />;
      case 'forming': return <Users className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'matched': return <Play className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-800/30 border-indigo-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Search className="w-5 h-5 text-indigo-400" />
          <span>Discord Bot Matchmaking</span>
          <Badge variant="default" className="bg-green-600">
            4v4 Ready
          </Badge>
        </CardTitle>
        <CardDescription className="text-indigo-200">
          Automated 4v4 matchmaking through Discord bot with ELO-based team balancing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Matchmaking Status */}
        <div className="bg-indigo-800/30 rounded-lg p-4 border border-indigo-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${searching ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <div>
                <div className="font-semibold text-white">
                  {searching ? 'Searching for 4v4 Match...' : 'Ready to Search'}
                </div>
                <div className="text-indigo-300 text-sm">
                  {searching 
                    ? `Search time: ${formatTime(searchTime)}` 
                    : 'Click start to begin 4v4 matchmaking'
                  }
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {!searching ? (
                <Button onClick={startMatchmaking} className="bg-green-600 hover:bg-green-700">
                  <Search className="w-4 h-4 mr-2" />
                  Start 4v4 Search
                </Button>
              ) : (
                <Button onClick={stopMatchmaking} variant="outline" className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                  <XCircle className="w-4 h-4 mr-2" />
                  Stop Search
                </Button>
              )}
            </div>
          </div>

          {/* Current Match Status */}
          {currentLobby && (
            <div className="bg-indigo-900/50 rounded p-3 border border-indigo-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(currentLobby.status)}
                  <span className={`font-semibold ${getStatusColor(currentLobby.status)}`}>
                    Current Lobby: {currentLobby.name}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-blue-600">
                  {currentLobby.players.length}/4 Players
                </Badge>
              </div>
              <div className="text-indigo-300 text-sm">
                Average ELO: {currentLobby.averageElo} • Created by: {currentLobby.createdBy}
              </div>
            </div>
          )}

          {matchFound && (
            <div className="bg-green-900/30 rounded p-3 border border-green-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-semibold text-green-400">Match Found!</div>
                  <div className="text-green-300 text-sm">4v4 lobby is ready to start</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Lobbies */}
        {searching && availableLobbies.length > 0 && (
          <div>
            <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Available 4v4 Lobbies</span>
              <Badge variant="secondary" className="bg-blue-600">
                {availableLobbies.length}
              </Badge>
            </h4>
            <div className="space-y-3">
              {availableLobbies.map(lobby => (
                <div
                  key={lobby.id}
                  className={`bg-gray-800/50 rounded-lg p-4 border transition-all ${
                    currentLobby?.id === lobby.id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white">{lobby.name}</div>
                      <div className="text-gray-400 text-sm">
                        {lobby.gameType} • Avg ELO: {lobby.averageElo}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">
                          {lobby.players.length}/4
                        </span>
                      </div>
                      <div className={`flex items-center space-x-1 ${getStatusColor(lobby.status)}`}>
                        {getStatusIcon(lobby.status)}
                        <span className="text-sm capitalize">{lobby.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Player List */}
                  <div className="flex space-x-2 mb-3">
                    {lobby.players.map(player => (
                      <div key={player.id} className="flex items-center space-x-2 bg-gray-700/50 rounded px-2 py-1">
                        <div className={`w-2 h-2 rounded-full ${player.ready ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="text-white text-sm">{player.name}</span>
                        <span className="text-blue-400 text-xs">({player.elo})</span>
                      </div>
                    ))}
                    {Array.from({ length: 4 - lobby.players.length }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-700/30 rounded px-2 py-1 border border-dashed border-gray-600">
                        <UserPlus className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400 text-sm">Empty Slot</span>
                      </div>
                    ))}
                  </div>

                  {currentLobby?.id !== lobby.id && lobby.players.length < 4 && (
                    <Button
                      onClick={() => joinLobby(lobby.id)}
                      variant="outline"
                      className="w-full bg-transparent border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join This Lobby
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matchmaking Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-900/20 rounded-lg p-3 text-center border border-blue-600">
            <div className="text-2xl font-bold text-blue-400">12</div>
            <div className="text-blue-300 text-sm">Players Searching</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3 text-center border border-green-600">
            <div className="text-2xl font-bold text-green-400">3</div>
            <div className="text-green-300 text-sm">Active 4v4 Lobbies</div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-3 text-center border border-yellow-600">
            <div className="text-2xl font-bold text-yellow-400">45s</div>
            <div className="text-yellow-300 text-sm">Avg Wait Time</div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-3 text-center border border-purple-600">
            <div className="text-2xl font-bold text-purple-400">87%</div>
            <div className="text-purple-300 text-sm">Match Success Rate</div>
          </div>
        </div>

        {/* Bot Commands */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Discord Bot Commands</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-700/50 rounded p-2">
              <code className="text-blue-400">/queue join 4v4-hockey</code>
              <div className="text-gray-400">Join 4v4 hockey matchmaking</div>
            </div>
            <div className="bg-gray-700/50 rounded p-2">
              <code className="text-blue-400">/queue status</code>
              <div className="text-gray-400">Check current queue status</div>
            </div>
            <div className="bg-gray-700/50 rounded p-2">
              <code className="text-blue-400">/queue leave</code>
              <div className="text-gray-400">Leave matchmaking queue</div>
            </div>
            <div className="bg-gray-700/50 rounded p-2">
              <code className="text-blue-400">/lobby create 4v4</code>
              <div className="text-gray-400">Create custom 4v4 lobby</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};