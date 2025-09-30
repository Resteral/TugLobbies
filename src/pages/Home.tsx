/**
 * Home page for TUG Lobbies - Main matchmaking hub with Supabase backend
 */

import React, { useState, useEffect } from 'react';
import { DiscordActivity } from '../components/zealot-hockey/DiscordActivity';
import { DiscordMatchmaking } from '../components/DiscordMatchmaking';
import { DiscordRichPresence } from '../components/DiscordRichPresence';
import { DiscordBotAuth } from '../components/DiscordBotAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trophy, Users, Gamepad2, Bot, Activity } from 'lucide-react';
import { Player, StoredLobby } from '../types/zealot-hockey';
import { createLobby, loadLobbies, updateLobby } from '../utils/lobby-storage';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [lobbies, setLobbies] = useState<StoredLobby[]>([]);
  const [activeTab, setActiveTab] = useState<'lobbies' | 'matchmaking' | 'discord'>('lobbies');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load lobbies from Supabase
      const initialLobbies = await loadLobbies();
      setLobbies(initialLobbies);
      
      // For now, using mock players - in a real app, you'd fetch from Supabase
      const mockPlayers: Player[] = [
        {
          id: '1',
          name: 'ZealotMaster',
          elo: 1450,
          matchesPlayed: 25,
          wins: 18,
          losses: 7,
          winRate: 72,
          lastPlayed: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          gameStats: {}
        },
        {
          id: '2',
          name: 'HockeyPro',
          elo: 1380,
          matchesPlayed: 22,
          wins: 15,
          losses: 7,
          winRate: 68,
          lastPlayed: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          gameStats: {}
        },
        {
          id: '3',
          name: 'SC2Champ',
          elo: 1420,
          matchesPlayed: 30,
          wins: 20,
          losses: 10,
          winRate: 67,
          lastPlayed: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          gameStats: {}
        },
        {
          id: '4',
          name: 'BeginnerPlayer',
          elo: 1200,
          matchesPlayed: 15,
          wins: 8,
          losses: 7,
          winRate: 53,
          lastPlayed: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          gameStats: {}
        }
      ];
      setPlayers(mockPlayers);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLobby = async (gameTypeId: string, draftType: 'snake' | 'auction') => {
    const gameTypes = {
      'zealot-hockey': { name: 'Zealot Hockey 1v1', maxPlayers: 2 },
      '2v2-hockey': { name: 'Zealot Hockey 2v2', maxPlayers: 4 },
      '3v3-hockey': { name: 'Zealot Hockey 3v3', maxPlayers: 6 },
      '4v4-hockey': { name: 'Zealot Hockey 4v4', maxPlayers: 8 },
      '1v1-sc2': { name: 'StarCraft II 1v1', maxPlayers: 2 },
      '2v2-sc2': { name: 'StarCraft II 2v2', maxPlayers: 4 },
      '3v3-sc2': { name: 'StarCraft II 3v3', maxPlayers: 6 },
      '4v4-sc2': { name: 'StarCraft II 4v4', maxPlayers: 8 }
    };

    const gameType = gameTypes[gameTypeId as keyof typeof gameTypes] || gameTypes['zealot-hockey'];
    
    const newLobby = await createLobby({
      name: `${gameType.name} Lobby`,
      gameType: gameTypeId,
      players: [],
      captainIds: [],
      status: 'waiting',
      createdBy: 'Player',
      draftType: draftType,
      maxPlayers: gameType.maxPlayers
    });

    setLobbies(prev => [...prev, newLobby]);
    return newLobby;
  };

  const handleJoinLobby = async (lobbyId: string) => {
    const lobby = lobbies.find(l => l.id === lobbyId);
    if (lobby && lobby.players.length < lobby.maxPlayers) {
      const updatedLobby = {
        ...lobby,
        players: [...lobby.players, {
          id: `player-${Date.now()}`,
          name: 'New Player',
          elo: 1300,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          lastPlayed: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          gameStats: {}
        }]
      };
      
      await updateLobby(updatedLobby);
      setLobbies(prev => prev.map(l => l.id === lobbyId ? updatedLobby : l));
    }
  };

  const currentActivity = {
    playersInQueue: 12,
    matchesInProgress: 3,
    averageWaitTime: '45s'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading TUG Lobbies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              TUG Lobbies
            </h1>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional StarCraft II matchmaking with ELO snake draft system. 
            Create and join 1v1 to 4v4 lobbies with automated team balancing.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1 max-w-md mx-auto">
          <Button
            onClick={() => setActiveTab('lobbies')}
            variant={activeTab === 'lobbies' ? 'default' : 'outline'}
            className={`flex-1 bg-transparent ${
              activeTab === 'lobbies' 
                ? 'bg-blue-600' 
                : 'border-gray-600 hover:border-blue-500'
            }`}
          >
            <Gamepad2 className="w-4 h-4 mr-2" />
            Lobbies
          </Button>
          <Button
            onClick={() => setActiveTab('matchmaking')}
            variant={activeTab === 'matchmaking' ? 'default' : 'outline'}
            className={`flex-1 bg-transparent ${
              activeTab === 'matchmaking' 
                ? 'bg-green-600' 
                : 'border-gray-600 hover:border-green-500'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            4v4 Matchmaking
          </Button>
          <Button
            onClick={() => setActiveTab('discord')}
            variant={activeTab === 'discord' ? 'default' : 'outline'}
            className={`flex-1 bg-transparent ${
              activeTab === 'discord' 
                ? 'bg-purple-600' 
                : 'border-gray-600 hover:border-purple-500'
            }`}
          >
            <Bot className="w-4 h-4 mr-2" />
            Discord Bot
          </Button>
        </div>

        {/* Main Content */}
        {activeTab === 'lobbies' && (
          <div className="space-y-6">
            <DiscordActivity
              players={players}
              lobbies={lobbies}
              onCreateLobby={handleCreateLobby}
              onJoinLobby={handleJoinLobby}
            />
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-600">
                <CardContent className="p-4 flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{players.length}</div>
                    <div className="text-blue-300 text-sm">Total Players</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600">
                <CardContent className="p-4 flex items-center space-x-3">
                  <Gamepad2 className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{lobbies.length}</div>
                    <div className="text-green-300 text-sm">Active Lobbies</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-600">
                <CardContent className="p-4 flex items-center space-x-3">
                  <Activity className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {Math.round(players.reduce((sum, p) => sum + p.elo, 0) / players.length)}
                    </div>
                    <div className="text-purple-300 text-sm">Average ELO</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'matchmaking' && (
          <div className="space-y-6">
            <DiscordMatchmaking />
            <DiscordRichPresence
              activeLobbies={lobbies.length}
              totalPlayers={players.length}
              currentActivity={currentActivity}
            />
          </div>
        )}

        {activeTab === 'discord' && (
          <div className="space-y-6">
            <DiscordBotAuth />
            <DiscordRichPresence
              activeLobbies={lobbies.length}
              totalPlayers={players.length}
              currentActivity={currentActivity}
            />
          </div>
        )}
      </div>
    </div>
  );
}
