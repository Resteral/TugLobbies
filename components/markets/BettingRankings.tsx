/**
 * BettingRankings
 * Purpose: Display top bettors by ROI from locally stored wagers.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CardDescription } from '../common/CardDescription';
import { Trophy, TrendingUp } from 'lucide-react';
import { safeGetItem, safeParseJSON } from '../../lib/utils';

interface Wager {
  id: string;
  marketId: string;
  optionId: string;
  amount: number;
  placedAt: string;
  userId: string;
}

const STORAGE_KEY_WAGERS = 'tug.wagers.v1';

/**
 * Compute simplistic ROI rankings.
 * For demo purposes, assume current unrealized return = amount * 0.05 (5%) to produce a ranking.
 */
function computeROIByUser(wagers: Wager[]): Array<{ userId: string; stake: number; roi: number }> {
  const byUser = new Map<string, { stake: number; roi: number }>();
  for (const w of wagers) {
    const prev = byUser.get(w.userId) || { stake: 0, roi: 0 };
    const stake = prev.stake + w.amount;
    const roi = prev.roi + w.amount * 0.05; // mock unrealized return
    byUser.set(w.userId, { stake, roi });
  }
  return Array.from(byUser.entries())
    .map(([userId, v]) => ({ userId, ...v }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);
}

/**
 * BettingRankings component
 */
export default function BettingRankings() {
  const [wagers, setWagers] = useState<Wager[]>([]);

  useEffect(() => {
    const raw = safeGetItem(STORAGE_KEY_WAGERS);
    setWagers(safeParseJSON<Wager[]>(raw, []));
  }, []);

  const top = useMemo(() => computeROIByUser(wagers), [wagers]);

  return (
    <Card className="bg-slate-800/30 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Betting Rankings
        </CardTitle>
        <CardDescription className="text-purple-200">
          Top bettors by ROI (demo calculation)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <div className="text-sm text-slate-300">No betting activity yet.</div>
        ) : (
          <div className="space-y-2">
            {top.map((u, idx) => (
              <div
                key={u.userId}
                className="flex items-center justify-between p-3 rounded bg-slate-900/40 border border-slate-700/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{u.userId}</div>
                    <div className="text-xs text-slate-400">Stake: {u.stake}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-400 font-semibold">
                  <TrendingUp className="w-4 h-4" /> +{u.roi.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
