/**
 * Individual lobby page for draft management
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Crown, Sword, Shield, UserPlus, UserMinus, Play, ArrowLeft, Trophy } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { getGameTypeById } from '../data/game-types';
import { getLobbyById, updateLobby, createLobby, StoredLobby, StoredLobbyPlayer } from '../utils/lobby-storage';

interface LobbyPlayer extends Player {
  isCaptain?: boolean;
  team?: 'A' | 'B';
  draftOrder?: number;
  ready?: boolean;
}

interface Lobby {
  id: string;
  name: string;
  gameType: string;
  players: LobbyPlayer[];
  captainIds: string[];
  status: 'waiting' | 'drafting' | 'ready' | 'in-progress';
  createdBy: string;
  createdAt: Date;
  draftType: 'snake' | 'auction';
  maxPlayers: number;
}

// Mock data - in a real app this would come from an API
const mockLobbies: Lobby[] = [
  {
    id: '1',
    name: 'Competitive 3v3',
    gameType: '3v3-hockey',
    players: [
      {
        id: '1',
        name: 'ZealotMaster',
        elo: 1450,
        matchesPlayed: 25,
        wins: 18,
        losses: 7,
        winRate: 72,
        lastPlayed: new Date('2024-01-15'),
        joinDate: new Date('2024-01-01'),
        gameStats: {},
        isCaptain: true,
        team: 'A',
        ready: true
      },
      {
        id: '2',
        name: 'HockeyPro',
        elo: 1380,
        matchesPlayed: 22,
        wins: 15,
        losses: 7,
        winRate: 68,
        lastPlayed: new Date('2024-01-14'),
        joinDate: new Date('2024-01-02'),
        gameStats: {},
        isCaptain: true,
        team: 'B',
        ready: true
      },
      {
        id: '3',
        name: 'SC2Champ',
        elo: 1320,
        matchesPlayed: 20,
        wins: 12,
        losses: 8,
        winRate: 60,
        lastPlayed: new Date('2024-01-13'),
        joinDate: new Date('2024-01-03'),
        gameStats: {},
        team: 'A',
        ready: true
      }
    ],
    captainIds: ['1', '2'],
    status: 'ready',
    createdBy: 'ZealotMaster',
    createdAt: new Date(),
    draftType: 'snake',
    maxPlayers: 6
  }
];

export default function LobbyPage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<StoredLobby | null>(null);
  const [draftPhase, setDraftPhase] = useState<'waiting' | 'drafting' | 'complete'>('waiting');
  const [currentDrafter, setCurrentDrafter] = useState<'captainA' | 'captainB'>('captainB');
  const [draftRound, setDraftRound] = useState(1);

  useEffect(() => {
    if (lobbyId) {
      console.log('Looking for lobby:', lobbyId);
      const foundLobby = getLobbyById(lobbyId);
      console.log('Found lobby:', foundLobby);
      
      if (foundLobby) {
        setLobby(foundLobby);
        // Set draft phase based on lobby status
        if (foundLobby.status === 'drafting') {
          setDraftPhase('drafting');
        } else if (foundLobby.status === 'ready') {
          setDraftPhase('complete');
        }
      } else {
        // Create a demo lobby if none exists (for testing)
        console.log('No lobby found, creating demo lobby');
        const demoLobby = createLobby({
          id: lobbyId,
          name: 'Demo Lobby',
          gameType: 'zealot-hockey',
          players: [
            {
              id: 'demo-player-1',
              name: 'Player 1',
              elo: 1450,
              matchesPlayed: 25,
              wins: 18,
              losses: 7,
              winRate: 72,
              lastPlayed: new Date().toISOString(),
              joinDate: new Date().toISOString(),
              gameStats: {},
              isCaptain: true,
              team: 'A',
              ready: true
            },
            {
              id: 'demo-player-2',
              name: 'Player 2',
              elo: 1380,
              matchesPlayed: 22,
              wins: 15,
              losses: 7,
              winRate: 68,
              lastPlayed: new Date().toISOString(),
              joinDate: new Date().toISOString(),
              gameStats: {},
              isCaptain: true,
              team: 'B',
              ready: true
            }
          ],
          captainIds: ['demo-player-1', 'demo-player-2'],
          status: 'waiting',
          createdBy: 'DemoUser',
          createdAt: new Date().toISOString(),
          draftType: 'snake',
          maxPlayers: 6
        });
        setLobby(demoLobby);
      }
    }
  }, [lobbyId]);

  const gameType = lobby ? getGameTypeById(lobby.gameType) : null;

  const handleDraftPick = (playerId: string) => {
    if (!lobby) return;

    const playerIndex = lobby.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const updatedPlayers = [...lobby.players];
    const team = currentDrafter === 'captainA' ? 'A' : 'B';
    
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      team,
      draftOrder: draftRound
    };

    const updatedLobby = {
      ...lobby,
      players: updatedPlayers
    };

    setLobby(updatedLobby);
    updateLobby(updatedLobby);

    // Snake draft logic
    const nextDrafter = currentDrafter === 'captainA' ? 'captainB' : 'captainA';
    const remainingUndrafted = updatedPlayers.filter(p => !p.team && !p.isCaptain).length;

    if (remainingUndrafted === 0) {
      setDraftPhase('complete');
    } else {
      const isEvenRound = draftRound % 2 === 0;
      const nextRound = isEvenRound ? draftRound + 1 : draftRound;
      const nextDraftOrder = isEvenRound ? 
        (nextDrafter === 'captainA' ? 'captainB' : 'captainA') : 
        nextDrafter;

      setCurrentDrafter(nextDraftOrder);
      if (!isEvenRound) {
        setDraftRound(draftRound + 1);
      }
    }
  };

  const startDraft = () => {
    if (!lobby) return;
    
    const updatedLobby = {
      ...lobby,
      status: 'drafting' as const
    };
    setLobby(updatedLobby);
    updateLobby(updatedLobby);
    setDraftPhase('drafting');
    setCurrentDrafter('captainB'); // Second highest ELO picks first
    setDraftRound(1);
  };

  const getTeamPlayers = (team: 'A' | 'B') => {
    if (!lobby) return [];
    return lobby.players.filter(p => p.team === team).sort((a, b) => (a.draftOrder || 0) - (b.draftOrder || 0));
  };

  const getAvailablePlayers = () => {
    if (!lobby) return [];
    return lobby.players.filter(p => !p.team && !p.isCaptain);
  };

  if (!lobby) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Lobby Not Found</h2>
            <p className="text-gray-400 mb-4">The lobby you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="bg-transparent border-gray-600 hover:border-blue-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lobbies
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              TUG Lobby: {lobby.name}
            </h1>
            <p className="text-gray-400">
              {gameType?.name} • {lobby.draftType} draft • {lobby.players.length}/{lobby.maxPlayers} players
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={lobby.status === 'ready' ? 'default' : 'secondary'} className={
              lobby.status === 'ready' ? 'bg-green-600' : 
              lobby.status === 'drafting' ? 'bg-yellow-600' : 'bg-blue-600'
            }>
              {lobby.status}
            </Badge>
            {lobby.status === 'waiting' && lobby.players.length >= 2 && (
              <Button onClick={startDraft}>
                <Play className="w-4 h-4 mr-2" />
                Start Draft
              </Button>
            )}
          </div>
        </div>

        {/* Draft Interface */}
        {draftPhase === 'drafting' && (
          <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-500 mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-400 text-center">
                Round {draftRound} - {currentDrafter === 'captainA' ? 'Captain A' : 'Captain B'}'s Pick
              </CardTitle>
              <CardDescription className="text-yellow-300 text-center">
                Select a player to add to your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {getAvailablePlayers().map(player => (
                  <Button
                    key={player.id}
                    onClick={() => handleDraftPick(player.id)}
                    variant="outline"
                    className="bg-transparent border-yellow-600 hover:border-yellow-400 hover:bg-yellow-500/10 justify-between h-auto py-3"
                  >
                    <div className="text-left">
                      <div className="text-white font-medium">{player.name}</div>
                      <div className="text-yellow-300 text-xs">ELO: {player.elo}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teams Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Team A */}
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-600">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Team A</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTeamPlayers('A').map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-blue-800/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-center space-x-3">
                    {player.isCaptain && <Crown className="w-4 h-4 text-yellow-400" />}
                    <div>
                      <div className="font-semibold text-white">{player.name}</div>
                      <div className="text-blue-300 text-sm">ELO: {player.elo}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 text-sm">Pick {player.draftOrder}</div>
                    {player.ready && <Badge className="bg-green-600">Ready</Badge>}
                  </div>
                </div>
              ))}
              {getTeamPlayers('A').length === 0 && (
                <div className="text-center text-blue-300 py-4">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No players drafted yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team B */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-600">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Team B</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTeamPlayers('B').map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-purple-800/20 rounded-lg border border-purple-500/30">
                  <div className="flex items-center space-x-3">
                    {player.isCaptain && <Crown className="w-4 h-4 text-yellow-400" />}
                    <div>
                      <div className="font-semibold text-white">{player.name}</div>
                      <div className="text-purple-300 text-sm">ELO: {player.elo}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400 text-sm">Pick {player.draftOrder}</div>
                    {player.ready && <Badge className="bg-green-600">Ready</Badge>}
                  </div>
                </div>
              ))}
              {getTeamPlayers('B').length === 0 && (
                <div className="text-center text-purple-300 py-4">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No players drafted yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Players */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>All Players in Lobby</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lobby.players.map(player => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border ${
                    player.isCaptain 
                      ? 'bg-yellow-500/20 border-yellow-500/50' 
                      : player.team === 'A'
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : player.team === 'B'
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-gray-700/50 border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {player.isCaptain && <Crown className="w-4 h-4 text-yellow-400" />}
                      <div>
                        <div className="font-semibold text-white">{player.name}</div>
                        <div className="text-gray-400 text-sm">ELO: {player.elo}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {player.team && (
                        <Badge variant={player.team === 'A' ? 'default' : 'secondary'} 
                          className={player.team === 'A' ? 'bg-blue-600' : 'bg-purple-600'}>
                          Team {player.team}
                        </Badge>
                      )}
                      {!player.team && lobby.status === 'waiting' && (
                        <Badge variant="secondary" className="bg-gray-600">Undrafted</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}