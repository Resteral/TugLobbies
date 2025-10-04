/**
 * BettingMarkets
 * Purpose: Display open betting markets and allow mock wagers with local persistence.
 * Notes:
 * - Client-only demo; replace with backend integration later.
 * - Persists to localStorage so users can return to the same state.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CardDescription } from '../common/CardDescription';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { cn, safeGetItem, safeParseJSON, safeSetItem } from '../../lib/utils';
import { Clock, Coins, Sparkles } from 'lucide-react';

type MarketStatus = 'open' | 'closed';

interface MarketOption {
  id: string;
  label: string;
  odds: number; // decimal odds (e.g., 1.8)
}

interface BettingMarket {
  id: string;
  title: string;
  status: MarketStatus;
  closesAt: string; // ISO
  options: MarketOption[];
  pool: number; // virtual pool
}

interface Wager {
  id: string;
  marketId: string;
  optionId: string;
  amount: number;
  placedAt: string;
  userId: string; // best-effort user id (accountId/name)
}

const STORAGE_KEY_MARKETS = 'tug.markets.v1';
const STORAGE_KEY_WAGERS = 'tug.wagers.v1';

/**
 * Seed a few demo markets if none exist.
 */
function defaultMarkets(): BettingMarket[] {
  const now = Date.now();
  return [
    {
      id: 'm1',
      title: 'Pro 4v4 — Tonight Match Winner',
      status: 'open',
      closesAt: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      options: [
        { id: 'a', label: 'Team Alpha', odds: 1.9 },
        { id: 'b', label: 'Team Beta', odds: 2.0 },
      ],
      pool: 1200,
    },
    {
      id: 'm2',
      title: 'Most Goals — Player',
      status: 'open',
      closesAt: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      options: [
        { id: 'p1', label: 'ZealotMaster', odds: 3.2 },
        { id: 'p2', label: 'HockeyPro', odds: 2.8 },
        { id: 'p3', label: 'GoalGuardian', odds: 3.6 },
      ],
      pool: 860,
    },
    {
      id: 'm3',
      title: 'Tournament — Overall Winner',
      status: 'open',
      closesAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
      options: [
        { id: 't1', label: 'Storm Hawks', odds: 2.6 },
        { id: 't2', label: 'Void Blades', odds: 3.1 },
        { id: 't3', label: 'Psi Wolves', odds: 4.0 },
      ],
      pool: 4000,
    },
  ];
}

/**
 * BettingMarkets component
 * Shows a list of markets and a simple wager form with persistence.
 */
export default function BettingMarkets() {
  const [markets, setMarkets] = useState<BettingMarket[]>([]);
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [selected, setSelected] = useState<{ marketId: string; optionId: string } | null>(null);
  const [amount, setAmount] = useState<string>('');

  // Load persisted markets/wagers
  useEffect(() => {
    const rawM = safeGetItem(STORAGE_KEY_MARKETS);
    const rawW = safeGetItem(STORAGE_KEY_WAGERS);
    const m = safeParseJSON<BettingMarket[]>(rawM, defaultMarkets());
    const w = safeParseJSON<Wager[]>(rawW, []);
    setMarkets(m);
    setWagers(w);
  }, []);

  // Persist when markets/wagers change
  useEffect(() => {
    safeSetItem(STORAGE_KEY_MARKETS, JSON.stringify(markets));
  }, [markets]);
  useEffect(() => {
    safeSetItem(STORAGE_KEY_WAGERS, JSON.stringify(wagers));
  }, [wagers]);

  // Simplified current user best-effort identifier
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem('tug-lobbies-current-player');
      if (raw) {
        const u = JSON.parse(raw);
        return u.accountId || u.name || 'guest';
      }
    } catch {
      // ignore
    }
    return 'guest';
  }, []);

  const myWagers = wagers.filter((w) => w.userId === currentUserId);

  const handlePlace = () => {
    if (!selected) return;
    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt <= 0) return;

    const w: Wager = {
      id: `w_${Date.now()}`,
      marketId: selected.marketId,
      optionId: selected.optionId,
      amount: Math.round(amt),
      placedAt: new Date().toISOString(),
      userId: currentUserId,
    };
    setWagers((prev) => [...prev, w]);

    // Add to market pool
    setMarkets((prev) =>
      prev.map((m) => (m.id === selected.marketId ? { ...m, pool: m.pool + w.amount } : m))
    );
    setAmount('');
  };

  return (
    <Card className="bg-slate-800/30 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" />
          Betting Markets
        </CardTitle>
        <CardDescription className="text-purple-200">
          Open markets you can join. Stored locally for persistence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Markets list */}
        <div className="space-y-3">
          {markets.map((m) => {
            const closesIn = Math.max(
              0,
              Math.floor((new Date(m.closesAt).getTime() - Date.now()) / 1000)
            );
            return (
              <div
                key={m.id}
                className="p-3 rounded-lg bg-slate-900/40 border border-slate-700/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-semibold">{m.title}</div>
                  <div className="flex items-center gap-2">
                    <Badge className={m.status === 'open' ? 'bg-green-600' : 'bg-slate-600'}>
                      {m.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      Pool: {m.pool}
                    </Badge>
                    <div className="text-xs text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {closesIn}s
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {m.options.map((o) => {
                    const isSelected = selected?.marketId === m.id && selected.optionId === o.id;
                    return (
                      <button
                        key={o.id}
                        className={cn(
                          'text-left p-3 rounded border transition-colors',
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500'
                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/60'
                        )}
                        onClick={() => setSelected({ marketId: m.id, optionId: o.id })}
                        disabled={m.status !== 'open'}
                        title={m.status !== 'open' ? 'Market closed' : 'Select outcome'}
                      >
                        <div className="text-slate-200 font-medium">{o.label}</div>
                        <div className="text-xs text-cyan-300">Odds: {o.odds.toFixed(2)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Place bet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs text-purple-300">Stake (points)</label>
            <Input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="bg-slate-700/50 border-purple-500/30 text-white"
            />
          </div>
          <Button
            onClick={handlePlace}
            disabled={!selected || !amount || parseFloat(amount) <= 0}
            className="bg-amber-600 hover:bg-amber-700"
            title={selected ? 'Place bet' : 'Select a market option first'}
          >
            <Sparkles className="w-4 h-4 mr-2" /> Place Bet
          </Button>
        </div>

        {/* My wagers */}
        <div className="pt-2 border-t border-slate-700/40">
          <div className="text-sm font-semibold text-white mb-2">My Wagers</div>
          {myWagers.length === 0 ? (
            <div className="text-xs text-slate-300">No wagers placed yet.</div>
          ) : (
            <div className="space-y-1 text-xs text-slate-300">
              {myWagers.map((w) => {
                const m = markets.find((mm) => mm.id === w.marketId);
                const o = m?.options.find((oo) => oo.id === w.optionId);
                return (
                  <div key={w.id} className="flex items-center justify-between">
                    <span>
                      {m?.title} — <span className="text-white">{o?.label}</span>
                    </span>
                    <span className="text-amber-300">+{w.amount}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
