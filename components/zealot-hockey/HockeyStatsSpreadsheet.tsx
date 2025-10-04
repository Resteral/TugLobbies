/**
 * Hockey Statistics Spreadsheet Component
 * Purpose: Compact, readable spreadsheet for hockey stats with full metrics coverage.
 * - Includes steals, turnovers, goals, assists, shots, pickups, passes, passes received, possession,
 *   shots allowed, saves, goalie time, and skater time.
 * - Column-driven rendering with formatting helpers for consistency.
 * - Graceful fallbacks for missing values and SSR-safe logic.
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Filter, User } from 'lucide-react';
import { HockeyPlayerStats } from '../../types/zealot-hockey';

/**
 * Extends the base HockeyPlayerStats type with optional advanced fields commonly used
 * across various CSV and stat sources to avoid type errors when fields are missing.
 */
type ExtendedHockeyStats = HockeyPlayerStats & Partial<{
  steals: number;
  turnovers: number;
  shots: number;
  pickups: number;
  passes: number;
  passesReceived: number;
  possession: number;       // seconds
  shotsAllowed: number;
  saves: number;
  goaltenderTime: number;   // seconds
  skaterTime: number;       // seconds
}>;

/**
 * Props for the HockeyStatsSpreadsheet component
 */
interface HockeyStatsSpreadsheetProps {
  /**
   * List of player statistics; extra fields are optional and rendered if present
   */
  stats?: ExtendedHockeyStats[];
}

/**
 * Convert a numeric seconds value into mm:ss for easier reading
 * Falls back to "—" when undefined or null
 */
function formatSecondsToMMSS(value: number | undefined | null): string {
  if (value === undefined || value === null) return '—';
  const total = Math.max(0, Math.floor(value));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

/**
 * Format a numeric value or return a placeholder when missing
 */
function formatNum(value: number | undefined | null): string {
  return value === undefined || value === null ? '—' : `${value}`;
}

/**
 * Safe calculation of save percentage from saves and shots allowed.
 * Returns a string like "78.6%" or "—" if not computable.
 */
function calcSavePct(saves?: number | null, shotsAllowed?: number | null): string {
  if (!saves && saves !== 0) return '—';
  if (!shotsAllowed || shotsAllowed <= 0) return '—';
  return `${((saves / shotsAllowed) * 100).toFixed(1)}%`;
}

/**
 * Compute a traffic-light badge color for rating values
 */
function ratingBadgeClass(rating?: number | null): string {
  const r = rating ?? 0;
  if (r >= 8) return 'bg-green-600 text-white';
  if (r >= 6) return 'bg-yellow-600 text-white';
  return 'bg-red-600 text-white';
}

/**
 * Hockey Statistics Spreadsheet Component
 * Displays hockey player statistics in an easy-to-read, compact spreadsheet.
 */
export function HockeyStatsSpreadsheet({ stats = [] }: HockeyStatsSpreadsheetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  /**
   * Filter stats by search and minimum rating.
   * Search matches player name or accountId (case-insensitive).
   */
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const minRating = ratingFilter ? parseFloat(ratingFilter) : undefined;

    return stats.filter((p) => {
      const matchesSearch =
        term.length === 0 ||
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.accountId && p.accountId.toLowerCase().includes(term));

      const matchesRating =
        minRating === undefined || (typeof p.rating === 'number' && p.rating >= minRating);

      return matchesSearch && matchesRating;
    });
  }, [stats, searchTerm, ratingFilter]);

  // Aggregate summary chips (compact, non-redundant)
  const totalPlayers = filtered.length;
  const totalGoals = filtered.reduce((sum, p) => sum + (p.goals ?? 0), 0);
  const totalAssists = filtered.reduce((sum, p) => sum + (p.assists ?? 0), 0);
  const totalShots = filtered.reduce((sum, p) => sum + (p.shots ?? 0), 0);
  const avgRating =
    filtered.reduce((sum, p) => sum + (p.rating ?? 0), 0) / (filtered.length || 1);

  /**
   * Column definition for consistent rendering and compact, readable layout.
   * Use short labels with titles for clarity; numeric columns right-aligned.
   */
  type Col = {
    key: string;
    label: string;
    title?: string;
    align?: 'left' | 'right';
    /**
     * Custom cell renderer for complex cells; otherwise uses row[key] with formatters.
     */
    render?: (row: ExtendedHockeyStats) => React.ReactNode;
    /**
     * Override formatter for plain numeric/string values
     */
    format?: (value: any, row: ExtendedHockeyStats) => React.ReactNode;
    /**
     * Optional header or cell class for fine-tuning styles
     */
    thClass?: string;
    tdClass?: string;
  };

  const columns: Col[] = [
    {
      key: 'accountId',
      label: 'Account ID',
      title: 'StarCraft II Account ID',
      align: 'left',
      tdClass: 'font-mono text-blue-300 text-xs',
      format: (v) => (v ? String(v) : 'N/A'),
    },
    {
      key: 'name',
      label: 'Player',
      title: 'Player Name',
      align: 'left',
      render: (row) => (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-purple-300" />
          <span className="font-medium text-white">{row.name ?? '—'}</span>
        </div>
      ),
    },
    { key: 'gamesPlayed', label: 'GP', title: 'Games Played', align: 'right', format: formatNum },
    { key: 'goals', label: 'G', title: 'Goals', align: 'right', format: (v) => <span className="text-green-400 font-semibold">{formatNum(v)}</span> },
    { key: 'assists', label: 'A', title: 'Assists', align: 'right', format: (v) => <span className="text-blue-400 font-semibold">{formatNum(v)}</span> },
    {
      key: 'points',
      label: 'P',
      title: 'Points (Goals + Assists)',
      align: 'right',
      render: (row) => <span className="font-bold text-white">{(row.goals ?? 0) + (row.assists ?? 0)}</span>,
    },
    { key: 'shots', label: 'SOG', title: 'Shots on Goal', align: 'right', format: formatNum },

    { key: 'steals', label: 'STL', title: 'Steals', align: 'right', format: formatNum },
    { key: 'turnovers', label: 'TOV', title: 'Turnovers', align: 'right', format: formatNum },
    { key: 'pickups', label: 'PKP', title: 'Pickups', align: 'right', format: formatNum },
    { key: 'passes', label: 'PAS', title: 'Passes', align: 'right', format: formatNum },
    { key: 'passesReceived', label: 'PR', title: 'Passes Received', align: 'right', format: formatNum },

    {
      key: 'possession',
      label: 'POSS',
      title: 'Possession Time (mm:ss)',
      align: 'right',
      format: (v) => formatSecondsToMMSS(v),
    },
    { key: 'shotsAllowed', label: 'SA', title: 'Shots Allowed (goalie)', align: 'right', format: formatNum },
    { key: 'saves', label: 'SV', title: 'Saves (goalie)', align: 'right', format: formatNum },
    {
      key: 'svPct',
      label: 'SV%',
      title: 'Save Percentage',
      align: 'right',
      render: (row) => <span className="text-cyan-300">{calcSavePct(row.saves, row.shotsAllowed)}</span>,
    },
    {
      key: 'goaltenderTime',
      label: 'GT',
      title: 'Goaltender Time (mm:ss)',
      align: 'right',
      format: (v) => formatSecondsToMMSS(v),
    },
    {
      key: 'skaterTime',
      label: 'SKT',
      title: 'Skater Time (mm:ss)',
      align: 'right',
      format: (v) => formatSecondsToMMSS(v),
    },
    {
      key: 'rating',
      label: 'RTG',
      title: 'Player Rating',
      align: 'right',
      render: (row) => (
        <Badge variant="secondary" className={ratingBadgeClass(row.rating)}>
          {typeof row.rating === 'number' ? row.rating.toFixed(1) : 'N/A'}
        </Badge>
      ),
    },
  ];

  return (
    <Card className="w-full bg-slate-800/30 border-purple-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-purple-400" />
            <span>Statistics Spreadsheet</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-purple-600 text-white">{totalPlayers} players</Badge>
            <Badge variant="secondary" className="bg-blue-600 text-white" title="Average Rating">
              Avg {isFinite(avgRating) ? avgRating.toFixed(1) : '—'}
            </Badge>
            <Badge variant="secondary" className="bg-green-600 text-white" title="Total Goals">
              G {totalGoals}
            </Badge>
            <Badge variant="secondary" className="bg-blue-600 text-white" title="Total Assists">
              A {totalAssists}
            </Badge>
            <Badge variant="secondary" className="bg-cyan-600 text-white" title="Total Shots">
              SOG {totalShots}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Compact toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-purple-300 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search name or account ID
            </label>
            <Input
              placeholder="e.g. ZealotMaster or 1-S2-1-..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-purple-300">Min Rating</label>
            <Input
              type="number"
              placeholder="e.g. 7.5"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300"
              min="0"
              max="10"
              step="0.1"
            />
          </div>
        </div>

        {/* Data Table */}
        {filtered.length > 0 ? (
          <div className="overflow-auto rounded-lg border border-slate-700/50">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-purple-500/30">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      title={c.title}
                      className={[
                        'py-2 px-3 text-purple-300 font-semibold',
                        c.align === 'right' ? 'text-right' : 'text-left',
                        c.thClass ?? '',
                      ].join(' ')}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {filtered.map((row, idx) => (
                  <tr
                    key={(row.accountId ?? row.name ?? idx).toString()}
                    className={idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/10'}
                  >
                    {columns.map((c) => {
                      const value: any = (row as any)[c.key];
                      const content =
                        c.render
                          ? c.render(row)
                          : c.format
                            ? c.format(value, row)
                            : (value ?? '—');

                      return (
                        <td
                          key={c.key}
                          className={[
                            'py-2 px-3',
                            c.align === 'right' ? 'text-right' : 'text-left',
                            'text-slate-200',
                            c.tdClass ?? '',
                          ].join(' ')}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🏒</div>
            <h3 className="text-lg font-semibold text-purple-300 mb-1">No Players Found</h3>
            <p className="text-purple-200 text-sm">
              {stats.length === 0
                ? 'No statistics available. Import your hockey data to get started.'
                : 'Try adjusting your search or rating filter.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
