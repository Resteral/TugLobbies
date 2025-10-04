/**
 * Draft Room Component
 * Handles both auction and snake draft systems with safe guards when no players/teams exist.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Trophy, Users, Clock, Gavel, ListOrdered, DollarSign } from 'lucide-react';
import { DraftType, DraftPlayer, TournamentPlayer } from '../../types/tournament-types';

interface DraftRoomProps {
  /** Tournament id to scope the draft (display only) */
  tournamentId: string;
  /** Draft mode */
  draftType: DraftType;
  /** Teams/captains participating in the draft */
  players: TournamentPlayer[];
  /** Player pool available for drafting/auction */
  draftPlayers: DraftPlayer[];
  /** Emits an auction bid */
  onBid?: (playerId: string, amount: number) => void;
  /** Emits a snake draft pick */
  onPick?: (playerId: string) => void;
  /** Current round number */
  currentRound?: number;
  /** Current pick number */
  currentPick?: number;
  /** Current team id on the clock (optional) */
  currentTeam?: string;
}

/**
 * DraftRoom
 * Renders available players and controls for auction/snake drafts.
 * All current-team reads are guarded so the UI never crashes when there are no teams yet.
 */
export function DraftRoom({
  tournamentId,
  draftType,
  players,
  draftPlayers,
  onBid,
  onPick,
  currentRound = 1,
  currentPick = 1,
  currentTeam,
}: DraftRoomProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<DraftPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  /** Whether there is at least one team */
  const hasTeams = players && players.length > 0;

  /**
   * Compute a safe "current team" summary for display.
   * Returns a fallback when no teams exist to avoid undefined.name access.
   */
  const currentTeamInfo = useMemo(() => {
    if (!hasTeams) {
      return { name: 'Your Team', budget: 0, draftedCount: 0 };
    }
    const team = players.find((p) => p.id === currentTeam) || players[0];
    const drafted = Array.isArray((team as any).draftedPlayers) ? (team as any).draftedPlayers.length : 0;
    const budget = (team as any).budget ?? 0;
    return {
      name: team.name || 'Team',
      budget,
      draftedCount: drafted,
    };
  }, [hasTeams, players, currentTeam]);

  // Filter available players and select a default candidate
  useEffect(() => {
    const available = (draftPlayers || []).filter((player) => !player.sold);
    setAvailablePlayers(available);
    if (available.length > 0 && (!selectedPlayer || selectedPlayer.sold)) {
      setSelectedPlayer(available[0]);
    }
    if (available.length === 0) {
      setSelectedPlayer(null);
    }
  }, [draftPlayers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer for auction mode
  useEffect(() => {
    if (draftType !== 'auction') return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    // Auto-pass when time runs out only if there are candidates
    if (timeLeft === 0) {
      handlePass();
    }
  }, [draftType, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Place a bid in auction mode with basic validation */
  const handleBid = () => {
    if (!selectedPlayer || bidAmount.trim() === '') return;

    const amount = Number.parseInt(bidAmount, 10);
    if (!Number.isFinite(amount)) return;

    const current = selectedPlayer.currentBid ?? selectedPlayer.baseValue;
    if (amount > current) {
      onBid?.(selectedPlayer.id, amount);
      setBidAmount('');
      setTimeLeft(30); // Reset timer
    }
  };

  /** Pick a player in snake mode */
  const handlePick = (playerId: string) => {
    onPick?.(playerId);
  };

  /** Move to next player during auction; safe when no candidates */
  const handlePass = () => {
    if (availablePlayers.length === 0) return;

    const currentIndex = selectedPlayer
      ? availablePlayers.findIndex((p) => p.id === selectedPlayer.id)
      : -1;
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + 1) % availablePlayers.length;

    setSelectedPlayer(availablePlayers[nextIndex] || null);
    setTimeLeft(30);
  };

  /** Snake draft order (reverses on even rounds) */
  const getDraftOrder = () => {
    const round = currentRound || 1;
    const isReverseRound = round % 2 === 0;
    const order = isReverseRound ? [...players].reverse() : players;
    return order;
  };

  return (
    <div className="space-y-6">
      {/* Draft Header */}
      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {draftType === 'auction' ? (
                <Gavel className="w-5 h-5 text-yellow-400" />
              ) : (
                <ListOrdered className="w-5 h-5 text-blue-400" />
              )}
              <span>{draftType === 'auction' ? 'Auction Draft' : 'Snake Draft'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-600 text-white">
                Round {currentRound}
              </Badge>
              <Badge variant="secondary" className="bg-blue-600 text-white">
                Pick {currentPick}
              </Badge>
              {draftType === 'auction' && (
                <Badge variant="secondary" className="bg-red-600 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  {timeLeft}s
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Players */}
        <Card className="lg:col-span-2 bg-slate-800/30 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-400" />
              <span>Available Players ({availablePlayers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availablePlayers.length === 0 ? (
                <div className="text-sm text-purple-300 p-3 rounded border border-slate-600 bg-slate-700/40">
                  No players available yet.
                </div>
              ) : (
                availablePlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPlayer?.id === player.id
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/70'
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{player.name}</div>
                        <div className="text-sm text-purple-300">{player.position}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {draftType === 'auction' ? (
                            <>
                              <DollarSign className="w-4 h-4 inline mr-1" />
                              {player.currentBid ?? player.baseValue}
                            </>
                          ) : (
                            `ELO: ${player.elo}`
                          )}
                        </div>
                        {player.currentBidder && (
                          <div className="text-xs text-yellow-400">
                            Bid by: {players.find((p) => p.id === player.currentBidder)?.name || '—'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Draft Controls */}
        <Card className="bg-slate-800/30 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">
              {draftType === 'auction' ? 'Bidding' : 'Draft Pick'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPlayer && (
              <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/30">
                <div className="text-lg font-bold text-white mb-2">{selectedPlayer.name}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-purple-300">Position:</div>
                  <div className="text-white">{selectedPlayer.position}</div>
                  <div className="text-purple-300">ELO:</div>
                  <div className="text-white">{selectedPlayer.elo}</div>
                  <div className="text-purple-300">Base Value:</div>
                  <div className="text-white">${selectedPlayer.baseValue}</div>
                  {typeof selectedPlayer.currentBid === 'number' && (
                    <>
                      <div className="text-purple-300">Current Bid:</div>
                      <div className="text-yellow-400">${selectedPlayer.currentBid}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {draftType === 'auction' ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">Bid Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleBid}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!bidAmount || !selectedPlayer}
                  >
                    Place Bid
                  </Button>
                  <Button
                    onClick={handlePass}
                    variant="outline"
                    className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    disabled={availablePlayers.length === 0}
                  >
                    Pass
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => selectedPlayer && handlePick(selectedPlayer.id)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedPlayer}
              >
                Draft Player
              </Button>
            )}

            {/* Current Team Info (safe) */}
            <div className="bg-slate-700/30 rounded-lg p-3 border border-blue-500/30">
              <div className="text-sm text-blue-300 mb-1">Your Team</div>
              <div className="text-white font-semibold">{currentTeamInfo.name}</div>
              {draftType === 'auction' && (
                <div className="text-sm text-green-400">Budget: ${currentTeamInfo.budget}</div>
              )}
              <div className="text-sm text-purple-300">Players: {currentTeamInfo.draftedCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Draft Order */}
      {draftType === 'snake' && players.length > 0 && (
        <Card className="bg-slate-800/30 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <ListOrdered className="w-5 h-5 text-blue-400" />
              <span>Draft Order</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 overflow-x-auto">
              {getDraftOrder().map((player, index) => (
                <div
                  key={player.id}
                  className={`flex-shrink-0 p-3 rounded-lg border min-w-[120px] text-center ${
                    player.id === currentTeam
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-slate-700/50 border-slate-600'
                  }`}
                >
                  <div className="text-sm text-purple-300">Pick {index + 1}</div>
                  <div className="text-white font-semibold">{player.name}</div>
                  <div className="text-xs text-gray-400">
                    {Array.isArray((player as any).draftedPlayers)
                      ? (player as any).draftedPlayers.length
                      : 0}{' '}
                    players
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
