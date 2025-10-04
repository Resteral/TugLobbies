/**
 * Tournament Creator Component
 * Enhanced tournament creation with draft type selection
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Gamepad2, Users, DollarSign, Calendar, Gavel, ListOrdered } from 'lucide-react';
import { Tournament, DraftType, TournamentFormat } from '../../types/tournament-types';
import { LeagueManager } from './LeagueManager';
import { LeagueSettings } from '../../types/tournament-types';

interface TournamentCreatorProps {
  onSubmit: (tournament: Omit<Tournament, 'id'>) => void;
  onCancel?: () => void;
}

/**
 * Tournament Creator Component
 * Creates tournaments with auction, snake draft, and league options
 */
export function TournamentCreator({ onSubmit, onCancel }: TournamentCreatorProps) {
  const [tournamentData, setTournamentData] = useState<Partial<Tournament>>({
    name: '',
    gameType: 'zealot-hockey',
    format: 'single-elimination',
    draftType: 'snake',
    status: 'registration',
    prizePool: 0,
    entryFee: 0,
    maxPlayers: 8,
    currentPlayers: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    organizer: '',
    description: '',
    rules: ['Best of 3 matches', 'No cheating'],
    players: []
  });

  const [showLeagueSettings, setShowLeagueSettings] = useState(false);
  const [leagueSettings, setLeagueSettings] = useState<LeagueSettings | null>(null);

  const handleInputChange = (key: keyof Tournament, value: any) => {
    setTournamentData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tournamentData.name || !tournamentData.gameType || !tournamentData.format) {
      alert('Please fill in all required fields');
      return;
    }

    const finalTournament: Omit<Tournament, 'id'> = {
      name: tournamentData.name!,
      gameType: tournamentData.gameType!,
      format: tournamentData.format!,
      draftType: tournamentData.draftType!,
      status: 'registration',
      prizePool: tournamentData.prizePool || 0,
      entryFee: tournamentData.entryFee || 0,
      maxPlayers: tournamentData.maxPlayers || 8,
      currentPlayers: 0,
      startDate: tournamentData.startDate!,
      endDate: tournamentData.endDate!,
      organizer: tournamentData.organizer || 'TUG Lobbies',
      description: tournamentData.description || '',
      rules: tournamentData.rules || [],
      leagueSettings: leagueSettings || undefined,
      players: []
    };

    onSubmit(finalTournament);
  };

  const handleLeagueCreate = (settings: LeagueSettings) => {
    setLeagueSettings(settings);
    setShowLeagueSettings(false);
    // Update tournament data for league format
    handleInputChange('format', 'league');
    handleInputChange('maxPlayers', settings.maxTeams);
  };

  const getDraftTypeIcon = (type: DraftType) => {
    switch (type) {
      case 'auction': return <Gavel className="w-4 h-4" />;
      case 'snake': return <ListOrdered className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getDraftTypeDescription = (type: DraftType) => {
    switch (type) {
      case 'auction': return 'Bid on players with virtual currency';
      case 'snake': return 'Pick players in snake draft order';
      case 'random': return 'Players assigned randomly to teams';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            <span>Create Tournament</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">Tournament Name *</label>
                  <Input
                    placeholder="Enter tournament name"
                    value={tournamentData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">Game Type *</label>
                  <Select
                    value={tournamentData.gameType}
                    onValueChange={(value) => handleInputChange('gameType', value)}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                      <SelectValue placeholder="Select game type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zealot-hockey">Zealot Hockey</SelectItem>
                      <SelectItem value="1v1-sc2">StarCraft II 1v1</SelectItem>
                      <SelectItem value="2v2-sc2">StarCraft II 2v2</SelectItem>
                      <SelectItem value="custom">Custom Game</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">Format *</label>
                  <Select
                    value={tournamentData.format}
                    onValueChange={(value: TournamentFormat) => handleInputChange('format', value)}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-elimination">Single Elimination</SelectItem>
                      <SelectItem value="double-elimination">Double Elimination</SelectItem>
                      <SelectItem value="round-robin">Round Robin</SelectItem>
                      <SelectItem value="swiss">Swiss System</SelectItem>
                      <SelectItem value="league">League</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">Max Players *</label>
                  <Input
                    type="number"
                    value={tournamentData.maxPlayers}
                    onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value))}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                    min="2"
                    max="64"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">Entry Fee</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={tournamentData.entryFee}
                    onChange={(e) => handleInputChange('entryFee', parseInt(e.target.value))}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">Prize Pool</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={tournamentData.prizePool}
                    onChange={(e) => handleInputChange('prizePool', parseInt(e.target.value))}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Draft Type Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-purple-300">Draft Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['auction', 'snake', 'random'] as DraftType[]).map((type) => (
                  <div
                    key={type}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      tournamentData.draftType === type
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/70'
                    }`}
                    onClick={() => handleInputChange('draftType', type)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {getDraftTypeIcon(type)}
                      <span className="font-semibold text-white capitalize">{type} Draft</span>
                    </div>
                    <p className="text-sm text-purple-300">
                      {getDraftTypeDescription(type)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Start Date</label>
                <Input
                  type="date"
                  value={tournamentData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">End Date</label>
                <Input
                  type="date"
                  value={tournamentData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">Description</label>
              <Textarea
                placeholder="Describe your tournament..."
                value={tournamentData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-slate-700/50 border-purple-500/30 text-white min-h-[100px]"
              />
            </div>

            {/* League Settings Button */}
            {tournamentData.format === 'league' && (
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={() => setShowLeagueSettings(!showLeagueSettings)}
                  variant="outline"
                  className="bg-transparent border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  {showLeagueSettings ? 'Hide League Settings' : 'Configure League Settings'}
                </Button>

                {showLeagueSettings && (
                  <LeagueManager onLeagueCreate={handleLeagueCreate} />
                )}

                {leagueSettings && !showLeagueSettings && (
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-green-400 font-semibold">League Settings Configured</div>
                        <div className="text-sm text-purple-300">
                          {leagueSettings.maxTeams} teams • {leagueSettings.draftType} draft • ${leagueSettings.salaryCap} cap
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        Ready
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Create Tournament
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1 bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}