/**
 * Global ELO Leaderboard
 * Renders a global leaderboard sourced from the players-store with live updates.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { Player } from '../../types/zealot-hockey';
import { loadPlayers } from '../../services/players-store';

/**
 * Simple trend based on ELO vs group average.
 */
function getTrendIcon(elo: number, avgElo: number) {
  if (elo > avgElo + 25) return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (elo < avgElo - 25) return <TrendingDown className="w-4 h-4 text-red-400" />;
  return null;
}

/**
 * GlobalEloLeaderboard component
 * Shows top N players by ELO with basic record details.
 */
export function GlobalEloLeaderboard({ limit = 10 }: { limit?: number }) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Initial load
    setPlayers(loadPlayers());

    // Listen to store changes
    const onUpdate = () => setPlayers(loadPlayers());
    window.addEventListener('players-store-updated', onUpdate as EventListener);
    window.addEventListener('storage', onUpdate);

    return () => {
      window.removeEventListener('players-store-updated', onUpdate as EventListener);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const { topPlayers, avgElo } = useMemo(() => {
    const sorted = [...players].sort((a, b) => (b.elo ?? 0) - (a.elo ?? 0));
    const selection = sorted.slice(0, limit);
    const average =
      selection.reduce((sum, p) => sum + (p.elo ?? 0), 0) /
      Math.max(1, selection.length);
    return { topPlayers: selection, avgElo: Math.round(average) };
  }, [players, limit]);

  return (
    <Card className="w-full bg-slate-800/30 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Global ELO Leaderboard</span>
          <Badge variant="secondary" className="bg-purple-600 text-white">
            Top {topPlayers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                index < 3
                  ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/50'
                  : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
              }`}
            >
              {/* Left: Rank and Name */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                  <span
                    className={`font-bold ${
                      index === 0
                        ? 'text-yellow-400'
                        : index === 1
                        ? 'text-gray-300'
                        : index === 2
                        ? 'text-orange-400'
                        : 'text-white'
                    }`}
                  >
                    #{index + 1}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-white">{player.name}</div>
                  <div className="text-sm text-gray-400">
                    {player.wins}W - {player.losses}L ({(player.winRate ?? 0).toFixed(1)}%)
                  </div>
                </div>
              </div>

              {/* Right: ELO and Matches */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1 justify-end">
                    {getTrendIcon(player.elo ?? 0, avgElo)}
                    <span className="font-bold text-blue-400">{player.elo ?? '—'}</span>
                  </div>
                  <div className="text-sm text-gray-400">ELO</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">{player.matchesPlayed ?? 0}</div>
                  <div className="text-sm text-gray-400">Matches</div>
                </div>
              </div>
            </div>
          ))}

          {topPlayers.length === 0 && (
            <div className="text-center text-gray-400 py-6">No players available.</div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-gray-400 text-sm">
            <div>Total Players: {players.length}</div>
            <div>Average ELO (Top {topPlayers.length}): {avgElo}</div>
            <div>Last Updated: {new Date().toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GlobalEloLeaderboard;
