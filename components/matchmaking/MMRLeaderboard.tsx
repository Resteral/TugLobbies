/**
 * MMR Leaderboard Component
 * Renders a compact ELO-based leaderboard for matchmaking (Top N).
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { getTierForElo } from '../../utils/tiers';
import { Crown, Trophy, TrendingUp, Users } from 'lucide-react';

/**
 * Minimal shape for leaderboard items, designed to work with hockey stats or generic player lists.
 */
export interface MMRLeaderboardItem {
  name?: string;
  accountId?: string;
  elo?: number;
  gamesPlayed?: number;
}

/**
 * Props for MMRLeaderboard
 */
interface MMRLeaderboardProps {
  /** Items to rank (only those with numeric ELO are considered) */
  items: MMRLeaderboardItem[];
  /** Max items to show */
  limit?: number;
  /** Title override */
  title?: string;
}

/**
 * MMRLeaderboard
 * Shows top players by ELO with rank decoration and quick stats.
 */
export const MMRLeaderboard: React.FC<MMRLeaderboardProps> = ({
  items,
  limit = 10,
  title = 'MMR Leaderboard',
}) => {
  // Filter valid entries and sort by ELO desc
  const ranked = useMemo(() => {
    return items
      .filter((p) => typeof p.elo === 'number')
      .sort((a, b) => (b.elo || 0) - (a.elo || 0))
      .slice(0, limit);
  }, [items, limit]);

  const averageElo = useMemo(() => {
    if (ranked.length === 0) return 0;
    return Math.round(
      ranked.reduce((sum, p) => sum + (p.elo || 0), 0) / ranked.length
    );
  }, [ranked]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Trophy className="w-5 h-5 text-gray-300" />;
      case 2:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded bg-slate-700/60 text-slate-200 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>
        );
    }
  };

  return (
    <Card className="bg-slate-800/30 border-purple-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span>{title}</span>
          </div>
          <Badge variant="secondary" className="bg-purple-600 text-white">
            Top {ranked.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/40 rounded p-3 text-center border border-purple-500/20">
            <div className="text-lg font-bold text-green-400">{averageElo}</div>
            <div className="text-xs text-green-300">Avg ELO (Top)</div>
          </div>
          <div className="bg-slate-700/40 rounded p-3 text-center border border-purple-500/20">
            <div className="text-lg font-bold text-blue-400">{ranked.length}</div>
            <div className="text-xs text-blue-300">Ranked Players</div>
          </div>
        </div>

        {/* Ranked list */}
        {ranked.length > 0 ? (
          <div className="space-y-2">
            {ranked.map((p, i) => (
              <div
                key={`${p.accountId || p.name || i}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/40 hover:bg-slate-700/40 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getRankIcon(i)}
                  <div>
                    <div className="text-white font-medium">
                      {p.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {p.accountId || '—'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-300">{p.elo}</div>
                  <div className="mt-1">
                    {(() => {
                      const tier = getTierForElo(p.elo);
                      return (
                        <span className={`inline-block text-xs px-2 py-0.5 rounded bg-gradient-to-r ${tier.gradientClass} text-white`}>
                          {tier.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-end mt-1">
                    <Users className="w-3 h-3 mr-1" />
                    {p.gamesPlayed ?? 0} games
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">📉</div>
            <div className="text-sm text-slate-300">No players with ELO found</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MMRLeaderboard;