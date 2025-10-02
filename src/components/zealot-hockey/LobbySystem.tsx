/**
 * Lobby system with standard and pro lobbies featuring ELO snake draft
 */

import React, { useState, useEffect } from 'react';
import { Player } from '../../types/zealot-hockey';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Crown, Sword, Shield, UserPlus, UserMinus } from 'lucide-react';

interface LobbySystemProps {
  players: Player[];
}

interface LobbyPlayer extends Player {
  isCaptain?: boolean;
  team?: 'A' | 'B';
  draftOrder?: number;
}

export const LobbySystem: React.FC<LobbySystemProps> = ({ players }) => {
  const [standardLobby, setStandardLobby] = useState<LobbyPlayer[]>([]);
  const [proLobby, setProLobby] = useState<LobbyPlayer[]>([]);
  const [draftPhase, setDraftPhase] = useState<'waiting' | 'drafting' | 'complete'>('waiting');
  const [currentDrafter, setCurrentDrafter] = useState<'captainA' | 'captainB'>('captainA');
  const [draftRound, setDraftRound] = useState(1);

  // Initialize captains for standard lobby (8 players max)
  useEffect(() => {
    if (standardLobby.length === 8 && draftPhase === 'waiting') {
      startDraft(standardLobby);
    }
  }, [standardLobby.length, draftPhase]);

  const startDraft = (lobbyPlayers: LobbyPlayer[]) => {
    const sortedByElo = [...lobbyPlayers].sort((a, b) => b.elo - a.elo);
    const captains = sortedByElo.slice(0, 2).map((player, index) => ({
      ...player,
      isCaptain: true,
      team: index === 0 ? 'A' : 'B',
      draftOrder: 0
    }));

    const remainingPlayers = sortedByElo.slice(2).map(player => ({
      ...player,
      isCaptain: false,
      team: undefined,
      draftOrder: undefined
    }));

    const updatedLobby = [...captains, ...remainingPlayers];
    setDraftPhase('drafting');
    setCurrentDrafter('captainB'); // Second highest ELO picks first
    setDraftRound(1);
    
    if (lobbyPlayers === standardLobby) {
      setStandardLobby(updatedLobby);
    } else {
      setProLobby(updatedLobby);
    }
  };

  const handleDraftPick = (playerId: string, lobbyType: 'standard' | 'pro') => {
    const lobby = lobbyType === 'standard' ? standardLobby : proLobby;
    const playerIndex = lobby.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const updatedLobby = [...lobby];
    const team = currentDrafter === 'captainA' ? 'A' : 'B';
    
    updatedLobby[playerIndex] = {
      ...updatedLobby[playerIndex],
      team,
      draftOrder: draftRound
    };

    // Update state
    if (lobbyType === 'standard') {
      setStandardLobby(updatedLobby);
    } else {
      setProLobby(updatedLobby);
    }

    // Snake draft logic: alternate between captains with order reversing each round
    const nextDrafter = currentDrafter === 'captainA' ? 'captainB' : 'captainA';
    const remainingUndrafted = updatedLobby.filter(p => !p.team && !p.isCaptain).length;

    if (remainingUndrafted === 0) {
      setDraftPhase('complete');
    } else {
      // In snake draft, the picking order alternates each round
      // Round 1: B, A
      // Round 2: A, B  
      // Round 3: B, A
      // etc.
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

  const addToLobby = (player: Player, lobbyType: 'standard' | 'pro') => {
    const lobby = lobbyType === 'standard' ? standardLobby : proLobby;
    const isInLobby = lobby.some(p => p.id === player.id);
    
    if (isInLobby) return;

    const lobbyPlayer: LobbyPlayer = {
      ...player,
      isCaptain: false,
      team: undefined,
      draftOrder: undefined
    };

    if (lobbyType === 'standard' && standardLobby.length < 8) {
      setStandardLobby(prev => [...prev, lobbyPlayer]);
    } else if (lobbyType === 'pro') {
      setProLobby(prev => [...prev, lobbyPlayer]);
    }
  };

  const removeFromLobby = (playerId: string, lobbyType: 'standard' | 'pro') => {
    if (lobbyType === 'standard') {
      setStandardLobby(prev => prev.filter(p => p.id !== playerId));
    } else {
      setProLobby(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const getTeamPlayers = (lobby: LobbyPlayer[], team: 'A' | 'B') => {
    return lobby.filter(p => p.team === team).sort((a, b) => (a.draftOrder || 0) - (b.draftOrder || 0));
  };

  const getAvailablePlayers = (lobby: LobbyPlayer[]) => {
    return lobby.filter(p => !p.team && !p.isCaptain);
  };

  const renderLobby = (lobby: LobbyPlayer[], lobbyType: 'standard' | 'pro', title: string, maxPlayers?: number) => (
    <Card className={`w-full ${
      lobbyType === 'standard' 
        ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700' 
        : 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-700'
    }`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{title}</span>
            {maxPlayers && (
              <span className="text-sm text-gray-400">
                ({lobby.length}/{maxPlayers})
              </span>
            )}
          </div>
          {lobby.length >= 8 && draftPhase === 'waiting' && (
            <Button 
              onClick={() => startDraft(lobby)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Sword className="w-4 h-4 mr-2" />
              Start Draft
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Team Display during/after draft */}
        {(draftPhase === 'drafting' || draftPhase === 'complete') && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-600">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-blue-400">Team A</span>
              </div>
              {getTeamPlayers(lobby, 'A').map((player, index) => (
                <div key={player.id} className="flex items-center space-x-2 p-2 bg-blue-800/20 rounded">
                  {player.isCaptain && <Crown className="w-3 h-3 text-yellow-400" />}
                  <span className="text-white text-sm">{player.name}</span>
                  <span className="text-blue-300 text-xs">(Pick {player.draftOrder})</span>
                </div>
              ))}
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-600">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-purple-400">Team B</span>
              </div>
              {getTeamPlayers(lobby, 'B').map((player, index) => (
                <div key={player.id} className="flex items-center space-x-2 p-2 bg-purple-800/20 rounded">
                  {player.isCaptain && <Crown className="w-3 h-3 text-yellow-400" />}
                  <span className="text-white text-sm">{player.name}</span>
                  <span className="text-purple-300 text-xs">(Pick {player.draftOrder})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draft Interface */}
        {draftPhase === 'drafting' && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-yellow-500/50">
            <div className="text-center mb-3">
              <div className="text-yellow-400 font-semibold">
                Round {draftRound} - {currentDrafter === 'captainA' ? 'Captain A' : 'Captain B'}'s Pick
              </div>
              <div className="text-gray-400 text-sm">
                Select a player to add to your team
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getAvailablePlayers(lobby).map(player => (
                <Button
                  key={player.id}
                  onClick={() => handleDraftPick(player.id, lobbyType)}
                  variant="outline"
                  className="bg-transparent border-gray-600 hover:border-yellow-500 hover:bg-yellow-500/10 justify-between"
                  size="sm"
                >
                  <span className="text-white">{player.name}</span>
                  <span className="text-blue-400 text-xs">ELO: {player.elo}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Player List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {lobby.map(player => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded border ${
                player.isCaptain 
                  ? 'bg-yellow-500/20 border-yellow-500/50' 
                  : player.team === 'A'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : player.team === 'B'
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-gray-700/50 border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                {player.isCaptain && <Crown className="w-4 h-4 text-yellow-400" />}
                <div>
                  <div className="font-medium text-white">{player.name}</div>
                  <div className="text-xs text-gray-400">ELO: {player.elo}</div>
                </div>
              </div>
              <Button
                onClick={() => removeFromLobby(player.id, lobbyType)}
                variant="outline"
                size="sm"
                className="bg-transparent border-red-600 hover:bg-red-600 hover:text-white"
              >
                <UserMinus className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Available Players for Lobby */}
        {draftPhase === 'waiting' && (
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-2">Add Players:</div>
            <div className="grid grid-cols-2 gap-2">
              {players
                .filter(p => !lobby.some(lp => lp.id === p.id))
                .slice(0, 4)
                .map(player => (
                  <Button
                    key={player.id}
                    onClick={() => addToLobby(player, lobbyType)}
                    variant="outline"
                    className="bg-transparent border-gray-600 hover:border-green-500 hover:bg-green-500/10 justify-between"
                    size="sm"
                    disabled={maxPlayers && lobby.length >= maxPlayers}
                  >
                    <span className="text-white">{player.name}</span>
                    <UserPlus className="w-3 h-3 text-green-400" />
                  </Button>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {renderLobby(standardLobby, 'standard', 'Standard Lobby (8 Players Max)', 8)}
      {renderLobby(proLobby, 'pro', 'Pro Lobby (Unlimited)', undefined)}
    </div>
  );
};