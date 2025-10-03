/**
 * BettingMarket Component
 * Displays open markets, settled markets, bet history, and supports auto-creating markets from an upcoming matches feed.
 * - Accurate odds derived from ELO via bettingService.buildOddsFromElo
 * - Tabs: Open | Settled | Bet History
 * - Optional auto-feed to generate markets from player list
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Trophy, DollarSign, CheckCircle, AlertTriangle, Plus, RefreshCw, History, Check, X, Play, Pause } from 'lucide-react';
import { bettingService, Market, Bet } from '../../services/betting-service';
import { getTierForElo } from '../../utils/tiers';
import { playerManagement } from '../../services/player-management';

/**
 * Small helper: seed a couple demo markets on first load if empty
 */
function seedDemoMarketsIfEmpty() {
  const current = bettingService.getMarkets();
  if (current.length === 0) {
    bettingService.createMarket('ZealotMaster', 'HockeyPro', 1450, 1380);
    bettingService.createMarket('GoalGuardian', 'PuckHunter', 1420, 1680);
  }
}

type TabKey = 'open' | 'settled' | 'bets';

interface BettingMarketProps {
  compact?: boolean;
}

/**
 * Choose two different players at random from playerManagement.getAllPlayers()
 */
function pickRandomPair(): { p1: any; p2: any } | null {
  const players = playerManagement.getAllPlayers();
  if (players.length < 2) return null;
  const i1 = Math.floor(Math.random() * players.length);
  let i2 = Math.floor(Math.random() * players.length);
  while (i2 === i1) i2 = Math.floor(Math.random() * players.length);
  const p1 = players[i1];
  const p2 = players[i2];
  return { p1, p2 };
}

export const BettingMarket: React.FC<BettingMarketProps> = ({ compact = false }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('open');

  // Open markets
  const [openMarkets, setOpenMarkets] = useState<Market[]>([]);
  // Settled markets
  const [settledMarkets, setSettledMarkets] = useState<Market[]>([]);
  // Bets (history)
  const [bets, setBets] = useState<Bet[]>([]);

  // Bet slip + action state
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'player1' | 'player2' | null>(null);
  const [stake, setStake] = useState<string>('10');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto feed controls
  const [feedOn, setFeedOn] = useState(false);
  const feedTimerRef = useRef<number | null>(null);

  const currentMarket = useMemo(
    () => openMarkets.find((m) => m.id === selectedMarket),
    [selectedMarket, openMarkets]
  );

  const chosenOutcome = useMemo(
    () => currentMarket?.outcomes.find((o) => o.key === (selectedOutcome || '')),
    [currentMarket, selectedOutcome]
  );

  const estPayout = useMemo(() => {
    const s = parseFloat(stake || '0');
    return chosenOutcome ? (s > 0 ? Number((s * chosenOutcome.odds).toFixed(2)) : 0) : 0;
  }, [chosenOutcome, stake]);

  useEffect(() => {
    seedDemoMarketsIfEmpty();
    refreshAll();
    return () => {
      if (feedTimerRef.current) {
        window.clearInterval(feedTimerRef.current);
        feedTimerRef.current = null;
      }
    };
  }, []);

  /**
   * Refresh current lists
   */
  const refreshAll = () => {
    setOpenMarkets(bettingService.getMarkets('open'));
    setSettledMarkets(bettingService.getMarkets('settled'));
    setBets(bettingService.getBets());
  };

  /**
   * Place a bet on the current selection
   */
  const placeBet = () => {
    if (!currentMarket || !selectedOutcome) return;
    const s = parseFloat(stake || '0');
    if (s <= 0) return;
    setLoading(true);
    const bet = bettingService.placeBet(currentMarket.id, selectedOutcome, s);
    setLoading(false);
    if (bet) {
      setStatusMsg(`Bet placed on ${chosenOutcome?.name} @ ${chosenOutcome?.odds} for $${bet.stake}`);
      setSelectedMarket(null);
      setSelectedOutcome(null);
      setStake('10');
      setBets(bettingService.getBets());
    } else {
      setStatusMsg('Failed to place bet. Try again.');
    }
  };

  /**
   * Create a quick ad-hoc market
   */
  const createQuickMarket = () => {
    const names: Array<[string, string, number, number]> = [
      ['IceWizard', 'BladeRunner', 1580, 1660],
      ['PuckMaestro', 'NetGuardian', 1725, 1610],
      ['FrostByte', 'SkateKing', 1490, 1555],
    ];
    const [n1, n2, e1, e2] = names[Math.floor(Math.random() * names.length)];
    bettingService.createMarket(n1, n2, e1, e2);
    setOpenMarkets(bettingService.getMarkets('open'));
  };

  /**
   * Auto feed: periodically create markets from player ELO
   */
  const toggleFeed = () => {
    if (!feedOn) {
      setFeedOn(true);
      // create one immediately
      createMarketFromPlayers();
      // and keep generating
      // @ts-ignore Node types vs browser timer
      feedTimerRef.current = window.setInterval(() => {
        createMarketFromPlayers();
      }, 8000);
    } else {
      setFeedOn(false);
      if (feedTimerRef.current) {
        window.clearInterval(feedTimerRef.current);
        feedTimerRef.current = null;
      }
    }
  };

  /**
   * Build a market from two randomly selected players with accurate ELO odds
   */
  const createMarketFromPlayers = () => {
    const pair = pickRandomPair();
    if (!pair) return;
    const p1 = pair.p1;
    const p2 = pair.p2;
    bettingService.createMarket(p1.name, p2.name, p1.elo, p2.elo);
    setOpenMarkets(bettingService.getMarkets('open'));
  };

  /**
   * Renders a list of markets, with outcomes as selectable buttons (for open markets)
   */
  const renderMarket = (m: Market, interactive = false) => {
    return (
      <div
        key={m.id}
        className={`rounded-lg p-3 border transition-colors ${
          interactive && selectedMarket === m.id
            ? 'bg-indigo-800/30 border-indigo-600'
            : 'bg-slate-800/40 border-slate-700 hover:bg-slate-700/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-600">{m.player1Name}</Badge>
            <span className="text-slate-300">vs</span>
            <Badge className="bg-rose-600">{m.player2Name}</Badge>
          </div>
          <Badge className={m.status === 'open' ? 'bg-gray-700 text-slate-200' : 'bg-green-700 text-white'}>
            {m.status === 'open' ? 'Open' : 'Settled'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          {m.outcomes.map((o) => {
            // give a small tier accent (demo) using player's name as pseudo ELO hint if unknown
            const tier = getTierForElo(o.name.includes(' ') ? 1600 : 1500);
            const isSelected = interactive && selectedMarket === m.id && selectedOutcome === o.key;
            return (
              <button
                key={o.key}
                onClick={() => {
                  if (!interactive) return;
                  setSelectedMarket(m.id);
                  setSelectedOutcome(o.key);
                }}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  isSelected ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-700 hover:border-indigo-500'
                }`}
                disabled={!interactive}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{o.name}</span>
                  <span className="text-indigo-300 font-mono">{o.odds.toFixed(2)}</span>
                </div>
                <div className="text-xs mt-1">
                  <span className={`px-2 py-0.5 rounded bg-gradient-to-r ${tier.gradientClass} text-white`}>
                    {tier.label}
                  </span>
                  {m.status === 'settled' && m.winner === o.key && (
                    <span className="ml-2 inline-flex items-center gap-1 text-emerald-300">
                      <Check className="w-3 h-3" />
                      Winner
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOpenTab = () => (
    <>
      {openMarkets.length === 0 ? (
        <div className="text-slate-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          No open markets. Create one or use the Auto Feed.
        </div>
      ) : (
        <div className="space-y-3">
          {openMarkets.map((m) => renderMarket(m, true))}
        </div>
      )}

      {/* Bet Slip */}
      <div className="rounded-lg p-3 border border-slate-700 bg-slate-800/40 mt-4">
        <div className="text-white font-medium mb-2">Bet Slip</div>
        {currentMarket && chosenOutcome ? (
          <>
            <div className="text-sm text-slate-300">
              {currentMarket.matchLabel} • Pick:{' '}
              <span className="text-white font-semibold">{chosenOutcome.name}</span> @{' '}
              <span className="text-indigo-300 font-mono">{chosenOutcome.odds.toFixed(2)}</span>
            </div>
            <div className="flex items-end gap-3 mt-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400">Stake ($)</label>
                <Input
                  value={stake}
                  type="number"
                  onChange={(e) => setStake(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  min="1"
                />
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Estimated Payout</div>
                <div className="text-emerald-300 font-bold">${estPayout}</div>
              </div>
            </div>
            <Button onClick={placeBet} disabled={loading} className="mt-3 bg-emerald-600 hover:bg-emerald-700 w-full">
              <Trophy className="w-4 h-4 mr-2" />
              Place Bet
            </Button>
          </>
        ) : (
          <div className="text-sm text-slate-400">Select a market and outcome to build your slip.</div>
        )}
      </div>
    </>
  );

  const renderSettledTab = () => (
    <>
      {settledMarkets.length === 0 ? (
        <div className="text-slate-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          No settled markets yet. Import CSV results to settle markets.
        </div>
      ) : (
        <div className="space-y-3">
          {settledMarkets.map((m) => renderMarket(m, false))}
        </div>
      )}
    </>
  );

  const renderBetsTab = () => (
    <>
      {bets.length === 0 ? (
        <div className="text-slate-300 text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          No bets placed yet.
        </div>
      ) : (
        <div className="space-y-2">
          {bets.map((b) => {
            const m =
              openMarkets.find((mm) => mm.id === b.marketId) ||
              settledMarkets.find((mm) => mm.id === b.marketId);
            const statusBadge =
              b.status === 'won'
                ? 'bg-emerald-600'
                : b.status === 'lost'
                ? 'bg-rose-600'
                : b.status === 'refunded'
                ? 'bg-yellow-600'
                : 'bg-gray-600';
            return (
              <div
                key={b.id}
                className="rounded-lg p-3 border bg-slate-800/50 border-slate-700 flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-medium">
                    {m?.matchLabel || b.marketId}
                  </div>
                  <div className="text-xs text-slate-300">
                    Pick: <span className="font-semibold">{b.outcomeKey}</span> @{' '}
                    <span className="font-mono">{b.odds.toFixed(2)}</span> • Stake: ${b.stake}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={statusBadge}>{b.status.toUpperCase()}</Badge>
                  <div className="text-xs text-slate-300 mt-1">
                    {b.payout !== undefined ? `Payout: $${b.payout}` : '—'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <Card className="bg-gradient-to-br from-slate-900/60 to-indigo-900/40 border-indigo-700/60">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Betting &amp; Markets
          </span>
          <div className="flex gap-2">
            {!compact && (
              <Button onClick={createQuickMarket} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-1" />
                New Market
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={refreshAll} className="border-indigo-600 text-indigo-300">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFeed}
              className={`${
                feedOn ? 'border-rose-600 text-rose-300' : 'border-emerald-600 text-emerald-300'
              }`}
            >
              {feedOn ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {feedOn ? 'Stop Auto Feed' : 'Start Auto Feed'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {statusMsg && (
          <div className="text-sm text-emerald-300 bg-emerald-900/20 border border-emerald-700/40 rounded p-2">
            <CheckCircle className="w-4 h-4 inline mr-1" />
            {statusMsg}
          </div>
        )}

        {/* Tabs (segmented buttons) */}
        <div className="inline-flex rounded-md overflow-hidden border border-slate-700">
          {(['open', 'settled', 'bets'] as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === key ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              } ${key !== 'bets' ? 'border-r border-slate-700' : ''}`}
            >
              {key === 'open' && 'Open Markets'}
              {key === 'settled' && 'Settled'}
              {key === 'bets' && 'Bet History'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pt-2">
          {activeTab === 'open' && renderOpenTab()}
          {activeTab === 'settled' && renderSettledTab()}
          {activeTab === 'bets' && renderBetsTab()}
        </div>
      </CardContent>
    </Card>
  );
};

export default BettingMarket;
