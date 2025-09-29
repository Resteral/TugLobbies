/**
 * TUG Lobbies component for 1v1 to 6v6 matchmaking lobbies with snake draft
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Player, GameType } from '../../types/zealot-hockey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Crown, Sword, Shield, UserPlus, Play, Clock, Trophy } from 'lucide-react';
import { Badge } from '../ui/badge';
import { gameTypes, getGameTypeById } from '../../data/game-types';
import { StoredLobby } from '../../utils/lobby-storage';

interface DiscordActivityProps {
  players: Player[];
  lobbies: StoredLobby[];
  onCreateLobby: (gameTypeId: string, draftType: 'snake' | 'auction') => StoredLobby;
  onJoinLobby: (lobbyId: string) => void;
}

export const DiscordActivity: React.FC<DiscordActivityProps> = ({ 
  players, 
  lobbies, 
  onCreateLobby, 
  onJoinLobby 
}) => {
  const navigate = useNavigate();

  const createNewLobby = (gameType: GameType) => {
    const newLobby = onCreateLobby(gameType.id, 'snake');
    // Navigate to the new lobby page
    navigate(`/lobby/${newLobby.id}`);
  };

  const joinLobby = (lobbyId: string) => {
    onJoinLobby(lobbyId);
    navigate(`/lobby/${lobbyId}`);
  };

  const renderLobbyCard = (lobby: StoredLobby) => {
    const gameType = getGameTypeById(lobby.gameType);
    
    return (
      <Card key={lobby.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{gameType?.icon}</span>
                <CardTitle className="text-white text-lg">{lobby.name}</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                {gameType?.name} • {lobby.draftType} draft • {lobby.players.length}/{lobby.maxPlayers} players
              </CardDescription>
            </div>
            <Badge variant={lobby.status === 'ready' ? 'default' : 'secondary'} className={
              lobby.status === 'ready' ? 'bg-green-600' : 
              lobby.status === 'drafting' ? 'bg-yellow-600' : 'bg-blue-600'
            }>
              {lobby.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
            <span>Created by {lobby.createdBy}</span>
            <span>{Math.floor((Date.now() - new Date(lobby.createdAt).getTime()) / 60000)}m ago</span>
          </div>
          
          {/* Player Avatars */}
          <div className="flex space-x-2 mb-3">
            {lobby.players.slice(0, 6).map(player => (
              <div key={player.id} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                player.isCaptain ? 'bg-yellow-500' : 'bg-blue-500'
              }`}>
                {player.name.charAt(0)}
              </div>
            ))}
            {lobby.players.length > 6 && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                +{lobby.players.length - 6}
              </div>
            )}
            {lobby.players.length === 0 && (
              <div className="text-gray-500 text-sm">Waiting for players...</div>
            )}
          </div>

          <Button 
            onClick={() => joinLobby(lobby.id)}
            className="w-full"
            disabled={lobby.players.length >= lobby.maxPlayers || lobby.status !== 'waiting'}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {lobby.players.length >= lobby.maxPlayers ? 'Lobby Full' : 'Join Lobby'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Lobby Creation */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Sword className="w-5 h-5" />
            <span>Create New Lobby</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Start a new matchmaking lobby with ELO snake draft system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {gameTypes.map(gameType => (
              <div key={gameType.id} className="text-center">
                <Button
                  onClick={() => createNewLobby(gameType)}
                  variant="outline"
                  className="bg-transparent w-full h-20 flex-col hover:border-blue-500 hover:bg-blue-500/10"
                >
                  <span className="text-lg mb-1">{gameType.icon}</span>
                  <div className="text-xs">
                    <div className="font-semibold">{gameType.name}</div>
                    <div className="text-gray-400">{gameType.teamSize}v{gameType.teamSize}</div>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Lobbies */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Active Lobbies</h2>
          <Badge variant="secondary" className="bg-blue-600">
            {lobbies.length} active
          </Badge>
        </div>

        {lobbies.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Active Lobbies</h3>
              <p className="text-gray-400 mb-4">Create the first lobby to start matchmaking!</p>
              <Button onClick={() => createNewLobby(gameTypes[0])}>
                <Play className="w-4 h-4 mr-2" />
                Create First Lobby
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lobbies.map(renderLobbyCard)}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-900/20 border-blue-600">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{players.length}</div>
            <div className="text-blue-300 text-sm">Total Players</div>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-600">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {lobbies.reduce((sum, lobby) => sum + lobby.players.length, 0)}
            </div>
            <div className="text-green-300 text-sm">Players in Lobbies</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-900/20 border-yellow-600">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {lobbies.filter(l => l.status === 'ready').length}
            </div>
            <div className="text-yellow-300 text-sm">Ready Lobbies</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/20 border-purple-600">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(players.reduce((sum, p) => sum + p.elo, 0) / players.length)}
            </div>
            <div className="text-purple-300 text-sm">Avg ELO</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};