/**
 * Players Store Service
 * LocalStorage-backed ELO/record store with helpers to apply match results.
 */

import { EloCalculator } from '../utils/elo-calculator';
import { Player } from '../types/zealot-hockey';
import { playerManagement } from './player-management';

const STORAGE_KEY = 'tug_players_store';

/**
 * Load players from localStorage fallback to playerManagement mock data.
 */
export function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as Player[];
      // Ensure required fields exist
      return arr.map((p) => ({
        ...p,
        lastPlayed: p.lastPlayed ? new Date(p.lastPlayed) : new Date(),
        joinDate: p.joinDate ? new Date(p.joinDate) : new Date(),
        gameStats: p.gameStats || {},
      }));
    }
  } catch {
    // ignore
  }
  return playerManagement.getAllPlayers();
}

/**
 * Save players to localStorage and notify listeners.
 */
export function savePlayers(players: Player[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  notifyUpdated();
}

/**
 * Emit a custom event so UI can refresh.
 */
export function notifyUpdated() {
  window.dispatchEvent(new CustomEvent('players-store-updated'));
}

/**
 * Get or create a player entry by name (case-insensitive).
 */
function getOrCreatePlayer(players: Player[], name: string): Player {
  const found =
    players.find(
      (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
    ) || null;

  if (found) return found;

  const newPlayer: Player = {
    id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountId: playerManagement.generateAccountId(),
    name: name.trim(),
    elo: EloCalculator.getStartingElo(),
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    lastPlayed: new Date(),
    joinDate: new Date(),
    gameStats: {},
  };
  players.push(newPlayer);
  return newPlayer;
}

/**
 * Apply single match result to players array by player names.
 */
export function applyMatchResult(
  players: Player[],
  player1Name: string,
  player2Name: string,
  winnerName: string
) {
  const p1 = getOrCreatePlayer(players, player1Name);
  const p2 = getOrCreatePlayer(players, player2Name);

  const p1Won =
    winnerName.trim().toLowerCase() === p1.name.trim().toLowerCase();

  const { newPlayer1Elo, newPlayer2Elo } = EloCalculator.calculateNewRatings(
    p1.elo,
    p2.elo,
    p1Won
  );

  // Update ELO
  p1.elo = newPlayer1Elo;
  p2.elo = newPlayer2Elo;

  // Update records
  p1.matchesPlayed += 1;
  p2.matchesPlayed += 1;

  if (p1Won) {
    p1.wins += 1;
    p2.losses += 1;
  } else {
    p2.wins += 1;
    p1.losses += 1;
  }

  // Win rates
  p1.winRate = Math.round((p1.wins / Math.max(1, p1.matchesPlayed)) * 1000) / 10;
  p2.winRate = Math.round((p2.wins / Math.max(1, p2.matchesPlayed)) * 1000) / 10;

  p1.lastPlayed = new Date();
  p2.lastPlayed = new Date();
}

/**
 * Apply multiple matches and persist.
 */
export function applyMatchesAndSave(
  matches: Array<{ player1Name: string; player2Name: string; winner: string }>
) {
  const players = loadPlayers();
  for (const m of matches) {
    if (!m.player1Name || !m.player2Name || !m.winner) continue;
    applyMatchResult(players, m.player1Name, m.player2Name, m.winner);
  }
  savePlayers(players);
}
