/**
 * Betting Service
 * Manages betting markets, bets, and settlement from CSV match results.
 * Uses localStorage for persistence. Intended for demo/preview.
 */

import { CSVMatchData } from '../utils/csv-parser';

export type MarketStatus = 'open' | 'settled';
export type BetStatus = 'pending' | 'won' | 'lost' | 'refunded';

export interface MarketOutcome {
  key: 'player1' | 'player2';
  name: string;
  odds: number; // decimal odds
}

export interface Market {
  id: string;
  player1Name: string;
  player2Name: string;
  matchLabel: string;
  outcomes: MarketOutcome[];
  status: MarketStatus;
  winner?: 'player1' | 'player2';
  createdAt: string;
}

export interface Bet {
  id: string;
  marketId: string;
  outcomeKey: MarketOutcome['key'];
  stake: number;
  odds: number;
  status: BetStatus;
  payout?: number;
  placedAt: string;
}

const LS_MARKETS = 'tug-betting-markets';
const LS_BETS = 'tug-betting-bets';

/**
 * Lightweight store with helpers
 */
class BettingService {
  private static instance: BettingService;

  static getInstance() {
    if (!BettingService.instance) BettingService.instance = new BettingService();
    return BettingService.instance;
  }

  private readMarkets(): Market[] {
    try {
      const raw = localStorage.getItem(LS_MARKETS);
      return raw ? (JSON.parse(raw) as Market[]) : [];
    } catch {
      return [];
    }
  }

  private writeMarkets(markets: Market[]) {
    localStorage.setItem(LS_MARKETS, JSON.stringify(markets));
  }

  private readBets(): Bet[] {
    try {
      const raw = localStorage.getItem(LS_BETS);
      return raw ? (JSON.parse(raw) as Bet[]) : [];
    } catch {
      return [];
    }
  }

  private writeBets(bets: Bet[]) {
    localStorage.setItem(LS_BETS, JSON.stringify(bets));
  }

  /**
   * Simple odds model: convert ELO difference into implied probabilities → decimal odds
   */
  public buildOddsFromElo(p1Elo = 1500, p2Elo = 1500): { p1Odds: number; p2Odds: number } {
    const expected1 = 1 / (1 + Math.pow(10, (p2Elo - p1Elo) / 400));
    const expected2 = 1 - expected1;
    // Convert to decimal odds with a small margin
    const margin = 0.05;
    const o1 = Math.max(1.1, (1 / expected1) * (1 + margin));
    const o2 = Math.max(1.1, (1 / expected2) * (1 + margin));
    return { p1Odds: Number(o1.toFixed(2)), p2Odds: Number(o2.toFixed(2)) };
  }

  /**
   * Create a market (mock upcoming match)
   */
  createMarket(player1Name: string, player2Name: string, p1Elo?: number, p2Elo?: number): Market {
    const { p1Odds, p2Odds } = this.buildOddsFromElo(p1Elo, p2Elo);
    const m: Market = {
      id: `mkt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      player1Name,
      player2Name,
      matchLabel: `${player1Name} vs ${player2Name}`,
      outcomes: [
        { key: 'player1', name: player1Name, odds: p1Odds },
        { key: 'player2', name: player2Name, odds: p2Odds },
      ],
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    const list = this.readMarkets();
    this.writeMarkets([m, ...list]);
    return m;
  }

  /**
   * Get markets by status
   */
  getMarkets(status?: MarketStatus): Market[] {
    const list = this.readMarkets();
    return status ? list.filter((m) => m.status === status) : list;
  }

  /**
   * Place a bet
   */
  placeBet(marketId: string, outcomeKey: MarketOutcome['key'], stake: number): Bet | null {
    const markets = this.readMarkets();
    const m = markets.find((mm) => mm.id === marketId && mm.status === 'open');
    if (!m || stake <= 0) return null;
    const out = m.outcomes.find((o) => o.key === outcomeKey);
    if (!out) return null;

    const bet: Bet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      marketId: m.id,
      outcomeKey,
      stake,
      odds: out.odds,
      status: 'pending',
      placedAt: new Date().toISOString(),
    };

    const bets = this.readBets();
    this.writeBets([bet, ...bets]);
    return bet;
  }

  /**
   * Get bets
   */
  getBets(): Bet[] {
    return this.readBets();
  }

  /**
   * Settle markets based on CSV matches (winner: string equals player name)
   * Returns settlement summary counts.
   */
  settleFromMatches(rows: CSVMatchData[]): { settled: number; updatedBets: number } {
    const markets = this.readMarkets();
    const bets = this.readBets();
    let settledCount = 0;
    let updatedBets = 0;

    const matchWinners = new Map<string, 'player1' | 'player2'>();
    rows.forEach((r) => {
      const key1 = `${r.player1Name} vs ${r.player2Name}`;
      const key2 = `${r.player2Name} vs ${r.player1Name}`;
      const winnerKey =
        r.winner === r.player1Name ? 'player1' : r.winner === r.player2Name ? 'player2' : undefined;
      if (winnerKey) {
        matchWinners.set(key1, winnerKey);
        matchWinners.set(key2, winnerKey === 'player1' ? 'player2' : 'player1');
      }
    });

    markets.forEach((m) => {
      if (m.status === 'open') {
        const winner = matchWinners.get(m.matchLabel);
        if (winner) {
          m.status = 'settled';
          m.winner = winner;
          settledCount += 1;

          bets
            .filter((b) => b.marketId === m.id && b.status === 'pending')
            .forEach((b) => {
              if (b.outcomeKey === winner) {
                b.status = 'won';
                b.payout = Number((b.stake * b.odds).toFixed(2));
              } else {
                b.status = 'lost';
                b.payout = 0;
              }
              updatedBets += 1;
            });
        }
      }
    });

    this.writeMarkets(markets);
    this.writeBets(bets);
    return { settled: settledCount, updatedBets };
  }
}

export const bettingService = BettingService.getInstance();
