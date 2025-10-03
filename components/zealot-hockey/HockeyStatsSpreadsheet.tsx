/**
 * Hockey Statistics Spreadsheet Component
 * Displays hockey player statistics with search, min rating, min ELO, tier filters,
 * sortable columns, summary metrics, and an embedded MMR leaderboard.
 */

import React, { useMemo, useState } from 'react';
import { HockeyPlayerStats } from '../../types/zealot-hockey';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Filter, User, ArrowUpDown } from 'lucide-react';
import { MMRLeaderboard } from '../matchmaking/MMRLeaderboard';
import { getTierForElo, TierInfo } from '../../utils/tiers';

interface HockeyStatsSpreadsheetProps {
  stats?: HockeyPlayerStats[];
}

/**
 * Map a tier label to ELO range predicate
 */
function tierPredicateFactory(label: TierInfo['label'] | 'All') {
  return (elo?: number) => {
    if (label === 'All') return true;
    const t = getTierForElo(elo);
    return t.label === label;
  };
}

export function HockeyStatsSpreadsheet({ stats = [] }: HockeyStatsSpreadsheetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [minEloFilter, setMinEloFilter] = useState('');
  const [sortBy, setSortBy] = useState<'elo' | 'rating' | 'games' | 'name'>('elo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [tierFilter, setTierFilter] = useState<TierInfo['label'] | 'All'>('All');

  /** Compare helper */
  const compare = (a: any, b: any) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (typeof a === 'number' && typeof b === 'number') return (a - b) * dir;
    const as = String(a ?? '');
    const bs = String(b ?? '');
    return as.localeCompare(bs) * dir;
  };

  /** Tier filter options */
  const tierOptions: Array<TierInfo['label'] | 'All'> = [
    'All',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Master',
    'Grandmaster',
  ];

  // Filtered + sorted stats
  const filteredStats = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const minRating = ratingFilter ? parseFloat(ratingFilter) : undefined;
    const minElo = minEloFilter ? parseInt(minEloFilter, 10) : undefined;
    const tierPred = tierPredicateFactory(tierFilter);

    const list = stats.filter((player: any) => {
      const matchesSearch =
        term === '' ||
        player.name?.toLowerCase().includes(term) ||
        player.accountId?.toLowerCase().includes(term);
      const matchesRating = minRating === undefined || (player.rating && player.rating >= minRating);
      const matchesElo = minElo === undefined || (typeof player.elo === 'number' && player.elo >= minElo);
      const matchesTier = tierPred(player.elo);

      return matchesSearch && matchesRating && matchesElo && matchesTier;
    });

    return list.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'elo':
          return compare(a.elo ?? -Infinity, b.elo ?? -Infinity);
        case 'rating':
          return compare(a.rating ?? -Infinity, b.rating ?? -Infinity);
        case 'games':
          return compare(a.gamesPlayed ?? 0, b.gamesPlayed ?? 0);
        case 'name':
          return compare(a.name ?? '', b.name ?? '');
        default:
          return 0;
      }
    });
  }, [stats, searchTerm, ratingFilter, minEloFilter, tierFilter, sortBy, sortDir]);

  // Summary statistics
  const totalPlayers = filteredStats.length;
  const averageRating =
    filteredStats.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / (totalPlayers || 1);
  const totalGoals = filteredStats.reduce((sum: number, p: any) => sum + (p.goals || 0), 0);
  const totalAssists = filteredStats.reduce((sum: number, p: any) => sum + (p.assists || 0), 0);
  const averageElo =
    filteredStats.reduce((sum: number, p: any) => sum + (p.elo || 0), 0) / (totalPlayers || 1);

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  const headerBtn =
    'inline-flex items-center gap-1 text-purple-300 font-semibold hover:text-white transition-colors';

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search Players &amp; Account IDs
            </label>
            <Input
              placeholder="Search by name or account ID (1-S2-1-...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">Minimum Rating</label>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">Minimum ELO</label>
            <Input
              type="number"
              placeholder="Filter by minimum ELO"
              value={minEloFilter}
              onChange={(e) => setMinEloFilter(e.target.value)}
              className="bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300"
              min="0"
              step="10"
            />
          </div>
          {/* Tier Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">Tier</label>
            <div className="flex flex-wrap gap-2">
              {tierOptions.map((t) => {
                const active = tierFilter === t;
                const cls = active
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700/50 text-purple-200 hover:bg-slate-700';
                return (
                  <button
                    key={t}
                    onClick={() => setTierFilter(t as any)}
                    className={`px-2 py-1 rounded text-xs border border-purple-500/30 ${cls}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
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
          <div className="bg-slate-700/50 rounded p-3 text-center border border-purple-500/20">
            <div className="text-lg font-bold text-cyan-400">
              {Number.isFinite(averageElo) ? Math.round(averageElo) : 0}
            </div>
            <div className="text-xs text-cyan-300">Avg ELO</div>
          </div>
        </div>

        {/* Data Table */}
        {filteredStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left py-3 px-4">
                    <button className={headerBtn} onClick={() => toggleSort('name')}>
                      Player <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-purple-300 font-semibold">Account ID</th>
                  <th className="text-right py-3 px-4">
                    <button className={headerBtn} onClick={() => toggleSort('games')}>
                      Games <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-purple-300 font-semibold">Goals</th>
                  <th className="text-right py-3 px-4 text-purple-300 font-semibold">Assists</th>
                  <th className="text-right py-3 px-4 text-purple-300 font-semibold">Points</th>
                  <th className="text-right py-3 px-4">
                    <button className={headerBtn} onClick={() => toggleSort('rating')}>
                      Rating <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">
                    <button className={headerBtn} onClick={() => toggleSort('elo')}>
                      ELO <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-purple-300 font-semibold">Tier</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((player: any, index: number) => (
                  <tr
                    key={player.accountId || index}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-white flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-400" />
                      {player.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-400 text-xs">
                      {player.accountId || 'N/A'}
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
                          (player.rating || 0) >= 8
                            ? 'bg-green-600'
                            : (player.rating || 0) >= 6
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        } text-white`}
                      >
                        {player.rating ? player.rating.toFixed(1) : 'N/A'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant="secondary"
                        className={`${
                          (player.elo || 0) >= 2000
                            ? 'bg-purple-600'
                            : (player.elo || 0) >= 1600
                            ? 'bg-blue-600'
                            : 'bg-gray-600'
                        } text-white`}
                      >
                        {typeof player.elo === 'number' ? player.elo : '—'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {(() => {
                        const tier = getTierForElo(player.elo);
                        return (
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded bg-gradient-to-r ${tier.gradientClass} text-white`}
                          >
                            {tier.label}
                          </span>
                        );
                      })()}
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
                : 'Try adjusting your search or tier filters to find players.'}
            </p>
          </div>
        )}

        {/* Embedded MMR Leaderboard for current filter */}
        <div className="mt-6">
          <MMRLeaderboard
            items={filteredStats.map((p: any) => ({
              name: p.name,
              accountId: p.accountId,
              elo: p.elo,
              gamesPlayed: p.gamesPlayed,
            }))}
            limit={8}
            title="MMR Leaderboard (Filtered)"
          />
        </div>
      </CardContent>
    </Card>
  );
}
