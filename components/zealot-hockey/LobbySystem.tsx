/**
 * Lobby System Component
 * Handles player lobbies and matchmaking without Select components
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Users, Plus, Search, Clock, Trophy } from 'lucide-react';

interface Lobby {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  gameType: string;
  created: Date;
}

export const LobbySystem: React.FC = () => {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<string>('all');

  // Mock data for lobbies
  useEffect(() => {
    const mockLobbies: Lobby[] = [
      {
        id: '1',
        name: 'Competitive Match',
        players: 4,
        maxPlayers: 6,
        gameType: 'competitive',
        created: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      },
      {
        id: '2',
        name: 'Casual Practice',
        players: 2,
        maxPlayers: 4,
        gameType: 'casual',
        created: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
      },
      {
        id: '3',
        name: 'Tournament Qualifier',
        players: 6,
        maxPlayers: 8,
        gameType: 'tournament',
        created: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
      }
    ];
    setLobbies(mockLobbies);
  }, []);

  const filteredLobbies = lobbies.filter(lobby => 
    lobby.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedGameType === 'all' || lobby.gameType === selectedGameType)
  );

  const createLobby = () => {
    const newLobby: Lobby = {
      id: Date.now().toString(),
      name: 'New Lobby',
      players: 1,
      maxPlayers: 6,
      gameType: 'casual',
      created: new Date()
    };
    setLobbies(prev => [newLobby, ...prev]);
  };

  const joinLobby = (lobbyId: string) => {
    setLobbies(prev => 
      prev.map(lobby => 
        lobby.id === lobbyId && lobby.players < lobby.maxPlayers
          ? { ...lobby, players: lobby.players + 1 }
          : lobby
      )
    );
  };

  const gameTypes = [
    { value: 'all', label: 'All Games' },
    { value: 'competitive', label: 'Competitive' },
    { value: 'casual', label: 'Casual' },
    { value: 'tournament', label: 'Tournament' }
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Matchmaking Lobbies</span>
            </CardTitle>
            <p className="text-gray-400">
              Join or create hockey matchmaking lobbies
            </p>
          </div>
          <Button onClick={createLobby} className="bg-green-600 hover:bg-green-700 mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Create Lobby
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search lobbies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div className="flex space-x-2">
            {gameTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedGameType === type.value ? 'default' : 'outline'}
                onClick={() => setSelectedGameType(type.value)}
                className={
                  selectedGameType === type.value 
                    ? 'bg-blue-600' 
                    : 'bg-transparent'
                }
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Lobby List */}
        <div className="space-y-3">
          {filteredLobbies.map((lobby) => (
            <div
              key={lobby.id}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-white font-semibold">{lobby.name}</h3>
                    <Badge className={
                      lobby.gameType === 'competitive' ? 'bg-red-600' :
                      lobby.gameType === 'tournament' ? 'bg-purple-600' : 'bg-green-600'
                    }>
                      {lobby.gameType}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{lobby.players}/{lobby.maxPlayers} players</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor((Date.now() - lobby.created.getTime()) / 60000)}m ago</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => joinLobby(lobby.id)}
                  disabled={lobby.players >= lobby.maxPlayers}
                  className={
                    lobby.players >= lobby.maxPlayers 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }
                >
                  {lobby.players >= lobby.maxPlayers ? 'Full' : 'Join'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredLobbies.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No lobbies found</p>
            <p className="text-sm">Try adjusting your search or create a new lobby</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};