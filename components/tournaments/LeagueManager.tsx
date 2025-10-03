/**
 * League Manager Component
 * Handles league creation and management with bidding systems
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, DollarSign, Calendar, Trophy, Settings } from 'lucide-react';
import { LeagueSettings, DraftType } from '../../types/tournament-types';

interface LeagueManagerProps {
  onLeagueCreate: (settings: LeagueSettings) => void;
  existingLeagues?: any[];
}

/**
 * League Manager Component
 * Creates and manages leagues with bidding systems
 */
export function LeagueManager({ onLeagueCreate, existingLeagues = [] }: LeagueManagerProps) {
  const [leagueSettings, setLeagueSettings] = useState<Partial<LeagueSettings>>({
    maxTeams: 8,
    teamOwnersEnabled: true,
    buyInEnabled: false,
    buyInAmount: 0,
    draftType: 'auction',
    salaryCap: 1000,
    rosterSize: 15
  });

  const handleSettingChange = (key: keyof LeagueSettings, value: any) => {
    setLeagueSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateLeague = () => {
    if (leagueSettings.maxTeams && leagueSettings.draftType && leagueSettings.salaryCap && leagueSettings.rosterSize) {
      const settings: LeagueSettings = {
        seasonStart: leagueSettings.seasonStart || new Date().toISOString().split('T')[0],
        seasonEnd: leagueSettings.seasonEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxTeams: leagueSettings.maxTeams,
        teamOwnersEnabled: leagueSettings.teamOwnersEnabled || false,
        buyInEnabled: leagueSettings.buyInEnabled || false,
        buyInAmount: leagueSettings.buyInAmount || 0,
        draftType: leagueSettings.draftType,
        salaryCap: leagueSettings.salaryCap,
        rosterSize: leagueSettings.rosterSize
      };
      onLeagueCreate(settings);
    }
  };

  return (
    <div className="space-y-6">
      {/* League Creation */}
      <Card className="bg-slate-800/30 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>Create New League</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* League Settings */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Max Teams</label>
                <Input
                  type="number"
                  value={leagueSettings.maxTeams}
                  onChange={(e) => handleSettingChange('maxTeams', parseInt(e.target.value))}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  min="4"
                  max="20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Draft Type</label>
                <Select
                  value={leagueSettings.draftType}
                  onValueChange={(value: DraftType) => handleSettingChange('draftType', value)}
                >
                  <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select draft type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auction">Auction Draft</SelectItem>
                    <SelectItem value="snake">Snake Draft</SelectItem>
                    <SelectItem value="random">Random Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Salary Cap</label>
                <Input
                  type="number"
                  value={leagueSettings.salaryCap}
                  onChange={(e) => handleSettingChange('salaryCap', parseInt(e.target.value))}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  min="500"
                  max="5000"
                />
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Roster Size</label>
                <Input
                  type="number"
                  value={leagueSettings.rosterSize}
                  onChange={(e) => handleSettingChange('rosterSize', parseInt(e.target.value))}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  min="10"
                  max="25"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Season Start</label>
                <Input
                  type="date"
                  value={leagueSettings.seasonStart}
                  onChange={(e) => handleSettingChange('seasonStart', e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Season End</label>
                <Input
                  type="date"
                  value={leagueSettings.seasonEnd}
                  onChange={(e) => handleSettingChange('seasonEnd', e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
              </div>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="teamOwners"
                checked={leagueSettings.teamOwnersEnabled}
                onChange={(e) => handleSettingChange('teamOwnersEnabled', e.target.checked)}
                className="rounded border-purple-500 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="teamOwners" className="text-sm text-purple-300">
                Team Owners
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="buyIn"
                checked={leagueSettings.buyInEnabled}
                onChange={(e) => handleSettingChange('buyInEnabled', e.target.checked)}
                className="rounded border-purple-500 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="buyIn" className="text-sm text-purple-300">
                Buy-in Required
              </label>
            </div>

            {leagueSettings.buyInEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Buy-in Amount</label>
                <Input
                  type="number"
                  value={leagueSettings.buyInAmount}
                  onChange={(e) => handleSettingChange('buyInAmount', parseInt(e.target.value))}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                  min="0"
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleCreateLeague}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Create League
          </Button>
        </CardContent>
      </Card>

      {/* Existing Leagues */}
      {existingLeagues.length > 0 && (
        <Card className="bg-slate-800/30 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Your Leagues ({existingLeagues.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingLeagues.map((league) => (
                <div
                  key={league.id}
                  className="p-4 rounded-lg bg-slate-700/50 border border-purple-500/30 hover:bg-slate-700/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{league.name}</div>
                      <div className="text-sm text-purple-300">{league.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-purple-600 text-white">
                          {league.draftType}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-600 text-white">
                          <Users className="w-3 h-3 mr-1" />
                          {league.currentPlayers}/{league.maxPlayers}
                        </Badge>
                      </div>
                      <div className="text-sm text-yellow-400 mt-1">
                        <DollarSign className="w-3 h-3 inline mr-1" />
                        Prize: ${league.prizePool}
                      </div>
                    </div>
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