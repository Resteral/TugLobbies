/**
 * Hockey Statistics Spreadsheet Component
 * Advanced filtering and data display with account ID tracking
 */

import React, { useState, useMemo } from 'react';
import { HockeyPlayerStats } from '../../types/zealot-hockey';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Filter, User } from 'lucide-react';

interface HockeyStatsSpreadsheetProps {
  stats?: HockeyPlayerStats[];
}

/**
 * Hockey Statistics Spreadsheet Component
 * Displays hockey player statistics in a spreadsheet format with advanced filtering
 */
export function HockeyStatsSpreadsheet({ stats = [] }: HockeyStatsSpreadsheetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  // Filter stats based on search criteria
  const filteredStats = useMemo(() => {
    return stats.filter(player => {
      const matchesSearch = searchTerm === '' || 
        player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.accountId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = ratingFilter === '' || 
        (player.rating && player.rating >= parseFloat(ratingFilter));
      
      return matchesSearch && matchesRating;
    });
  }, [stats, searchTerm, ratingFilter]);

  // Calculate summary statistics
  const totalPlayers = filteredStats.length;
  const averageRating = filteredStats.reduce((sum, player) => sum + (player.rating || 0), 0) / totalPlayers || 0;
  const totalGoals = filteredStats.reduce((sum, player) => sum + (player.goals || 0), 0);
  const totalAssists = filteredStats.reduce((sum, player) => sum + (player.assists || 0), 0);

  return (
    <Card className="w-full bg-slate-800/30 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-purple-400" />
            <span>Statistics Spreadsheet</span>
          </div>
          <Badge variant="secondary" className="bg-purple-600 text-white">
            {filteredStats.length} players
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search Players & Account IDs
            </label>
            <Input
              placeholder="Search by name or account ID (1-S2-1-...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">
              Minimum Rating
            </label>
            <Input
              type="number"
              placeholder="Filter by minimum rating"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300"
              min="0"
              max="10"
              step="0.1"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-700/50 rounded p-3 text-center border border-purple-500/20">
            <div className="text-lg font-bold text-purple-400">{totalPlayers}</div>
            <div className="text-xs text-purple-300">Players</div>
          </div>
          <div className="bg-slate-700/50 rounded p-3 text-center border border-purple-500/20">
            <div className="text-lg font-bold text-green-400">{averageRating.toFixed(1)}</div>
            <div className="text-xs text-green-300">Avg Rating</div>
          </div>
          <div className="bg-slate-700/50 rounded p-3 text-center border border-purple-500/20">
            <div className="text-lg font-bold text-blue-400">{totalGoals}</div>
            <div className="text-xs text-blue-300">Total Goals</div>
          </div>
          <div className="bg-slate-700/50 rounded p-3 text-center border border-purple-500/20">
            <div className="text-lg font-bold text-yellow-400">{totalAssists}</div>
            <div className="text-xs text-yellow-300">Total Assists</div>
          </div>
        </div>

        {/* Data Table */}
        {filteredStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left py-3 px-4 text-purple-300 font-semibold">Account ID</th>
                  <th className="text-left py-3 px-4 text-purple-300 font-semibold">Player</th>
                  <th className="text-right py-3 px-4 text-purple-300 font-semibold">Games</th>
                  <th className="text-right py-3 px-4 text-purple-300 font-semibold">Goals</th>
                  <th className="text-right py-3 px-4 text-purple-300 font-semibold">Assists</th>
                  <th className="text-right py-3 px-4 text-purple-300 font-semibold">Points</th>
                  <th className="text-right py-3 px-4 text-purple-300 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((player, index) => (
                  <tr 
                    key={player.accountId || index} 
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-blue-400 text-xs">
                      {player.accountId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium text-white flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-400" />
                      {player.name}
                    </td>
                    <td className="py-3 px-4 text-right">{player.gamesPlayed || 0}</td>
                    <td className="py-3 px-4 text-right text-green-400 font-semibold">
                      {player.goals || 0}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-400 font-semibold">
                      {player.assists || 0}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {(player.goals || 0) + (player.assists || 0)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge 
                        variant="secondary" 
                        className={`${
                          (player.rating || 0) >= 8 ? 'bg-green-600' :
                          (player.rating || 0) >= 6 ? 'bg-yellow-600' : 'bg-red-600'
                        } text-white`}
                      >
                        {player.rating ? player.rating.toFixed(1) : 'N/A'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏒</div>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">No Players Found</h3>
            <p className="text-purple-200 text-sm">
              {stats.length === 0 
                ? 'No statistics available. Import your hockey data to get started.' 
                : 'Try adjusting your search criteria to find players.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}