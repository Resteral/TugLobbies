/**
 * Tournament Manager Component
 * Handles tournament management and operations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Trophy, Users, Calendar, Settings, Play, Trash2, Edit, Activity } from 'lucide-react';
import { Tournament, TournamentPlayer } from '../../types/tournament-types';
import { DraftRoom } from './DraftRoom';
import { useDiscordActivity } from '../../hooks/useDiscordActivity';

interface TournamentManagerProps {
  tournament: Tournament;
  onUpdate: (tournament: Tournament) => void;
  onDelete: (tournamentId: string) => void;
}

/**
 * Tournament Manager Component
 * Manages individual tournament operations
 */
export function TournamentManager({ tournament, onUpdate, onDelete }: TournamentManagerProps) {
  const [showDraftRoom, setShowDraftRoom] = useState(false);
  const [players, setPlayers] = useState<TournamentPlayer[]>(tournament.players || []);
  const [draftPlayers, setDraftPlayers] = useState<any[]>([]);
  
  // Discord Activity integration
  const { 
    updateTournamentActivity, 
    updateDraftActivity, 
    updateLiveTournamentActivity,
    clearActivity,
    isConnected,
    activityStatus 
  } = useDiscordActivity();

  // Initialize draft players
  useEffect(() => {
    const mockDraftPlayers = [
      { id: '1', name: 'Player 1', position: 'Forward', elo: 1500, baseValue: 100, currentBid: 0, sold: false },
      { id: '2', name: 'Player 2', position: 'Defense', elo: 1450, baseValue: 90, currentBid: 0, sold: false },
      { id: '3', name: 'Player 3', position: 'Goalie', elo: 1600, baseValue: 120, currentBid: 0, sold: false },
      { id: '4', name: 'Player 4', position: 'Forward', elo: 1400, baseValue: 80, currentBid: 0, sold: false },
      { id: '5', name: 'Player 5', position: 'Defense', elo: 1550, baseValue: 110, currentBid: 0, sold: false },
    ];
    setDraftPlayers(mockDraftPlayers);
  }, []);

  const handleBid = (playerId: string, amount: number) => {
    setDraftPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, currentBid: amount, currentBidder: 'current-user' }
        : player
    ));
  };

  const handlePick = (playerId: string) => {
    const player = draftPlayers.find(p => p.id === playerId);
    if (player) {
      const newPlayer: TournamentPlayer = {
        id: player.id,
        name: player.name,
        teamId: 'user-team',
        budget: tournament.leagueSettings?.salaryCap || 1000,
        draftedPlayers: [...(players[0]?.draftedPlayers || []), player]
      };
      
      setPlayers([newPlayer]);
      setDraftPlayers(prev => prev.map(p => 
        p.id === playerId ? { ...p, sold: true } : p
      ));

      // Update Discord activity for draft progress
      if (isConnected && showDraftRoom) {
        const currentPick = draftPlayers.filter(p => p.sold).length + 1;
        const totalPicks = tournament.leagueSettings?.rosterSize || 8;
        updateDraftActivity(tournament.name, tournament.draftType, currentPick, totalPicks);
      }
    }
  };

  // Update Discord activity when tournament status changes
  useEffect(() => {
    if (isConnected) {
      updateTournamentActivity({
        tournamentName: tournament.name,
        gameType: tournament.gameType,
        playerCount: players.length,
        maxPlayers: tournament.maxPlayers,
        status: tournament.status,
        currentRound: 1,
        totalRounds: tournament.leagueSettings?.totalRounds || 5
      });
    }
  }, [tournament.status, players.length, isConnected, tournament.name, tournament.gameType, tournament.maxPlayers, updateTournamentActivity]);

  const startTournament = () => {
    const updatedTournament = {
      ...tournament,
      status: 'live' as const
    };
    onUpdate(updatedTournament);
    
    // Update Discord activity for live tournament
    if (isConnected) {
      updateLiveTournamentActivity(
        tournament.name,
        1,
        tournament.leagueSettings?.totalRounds || 5,
        players.length
      );
    }
  };

  const deleteTournament = () => {
    if (confirm('Are you sure you want to delete this tournament?')) {
      onDelete(tournament.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration': return 'bg-blue-600';
      case 'live': return 'bg-green-600';
      case 'completed': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl">{tournament.name}</CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={getStatusColor(tournament.status)}>
                  {tournament.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="bg-transparent text-purple-300 border-purple-500">
                  {tournament.draftType} Draft
                </Badge>
                <Badge variant="outline" className="bg-transparent text-blue-300 border-blue-500">
                  {tournament.format}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowDraftRoom(!showDraftRoom)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                {showDraftRoom ? 'Hide Draft' : 'Start Draft'}
              </Button>
              <Button
                onClick={startTournament}
                disabled={tournament.status === 'live'}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Tournament
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={deleteTournament}
                variant="outline"
                className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300">Players:</span>
              <span className="text-white">{players.length}/{tournament.maxPlayers}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-purple-300">Discord:</span>
              <Badge variant={isConnected ? "default" : "secondary"} className={
                isConnected ? "bg-green-600" : "bg-gray-600"
              }>
                {isConnected ? "Connected" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-purple-300">Prize Pool:</span>
              <span className="text-yellow-400">${tournament.prizePool}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-purple-300">Start:</span>
              <span className="text-white">{new Date(tournament.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-purple-300">End:</span>
              <span className="text-white">{new Date(tournament.endDate).toLocaleDateString()}</span>
            </div>
          </div>
          {activityStatus && (
            <div className="mt-3 text-xs text-purple-300">
              Discord Activity: {activityStatus}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draft Room */}
      {showDraftRoom && (
        <DraftRoom
          tournamentId={tournament.id}
          draftType={tournament.draftType}
          players={players}
          draftPlayers={draftPlayers}
          onBid={handleBid}
          onPick={handlePick}
          currentRound={1}
          currentPick={1}
          currentTeam={players[0]?.id}
        />
      )}

      {/* Players List */}
      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-400" />
            <span>Registered Players ({players.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {players.length > 0 ? (
            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={player.id} className="p-4 rounded-lg bg-slate-700/50 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{player.name}</div>
                      <div className="text-sm text-purple-300">
                        Budget: ${player.budget} • Players: {player.draftedPlayers?.length || 0}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      Team {index + 1}
                    </Badge>
                  </div>
                  {player.draftedPlayers && player.draftedPlayers.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-purple-300 mb-2">Drafted Players:</div>
                      <div className="flex flex-wrap gap-2">
                        {player.draftedPlayers.map((draftedPlayer) => (
                          <Badge key={draftedPlayer.id} variant="outline" className="bg-transparent text-green-400 border-green-500">
                            {draftedPlayer.name} (${draftedPlayer.baseValue})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-purple-300">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No players registered yet</p>
              <p className="text-sm">Players will appear here once they join the tournament</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tournament Info */}
      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Tournament Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Rules</h4>
              <ul className="space-y-2 text-purple-300">
                {tournament.rules.map((rule, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-400">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Description</h4>
              <p className="text-purple-300">{tournament.description || 'No description provided.'}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-300">Organizer:</span>
                  <span className="text-white">{tournament.organizer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Entry Fee:</span>
                  <span className="text-white">${tournament.entryFee}</span>
                </div>
                {tournament.leagueSettings && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Salary Cap:</span>
                      <span className="text-white">${tournament.leagueSettings.salaryCap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Roster Size:</span>
                      <span className="text-white">{tournament.leagueSettings.rosterSize}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}