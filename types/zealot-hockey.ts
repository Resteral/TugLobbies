/**
 * Type definitions for TUG Lobbies matchmaking system
 */

export interface GameType {
  id: string;
  name: string;
  description: string;
  teamSize: number;
  maxPlayers: number;
  icon: string;
}

export interface Player {
  id: string;
  name: string;
  elo: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  lastPlayed: Date;
  joinDate: Date;
  gameStats: { [gameId: string]: GameStats };
}

export interface GameStats {
  elo: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  lastPlayed: Date;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  winnerId: string;
  date: Date;
  player1EloChange: number;
  player2EloChange: number;
  gameType: string;
  replayData?: ReplayData;
}

export interface ReplayData {
  id: string;
  matchId: string;
  duration: number;
  map: string;
  player1APM: number;
  player2APM: number;
  player1Hotkeys: number;
  player2Hotkeys: number;
  analysisScore: number;
}

export interface MatchmakingQueue {
  playerId: string;
  playerName: string;
  elo: number;
  queueTime: Date;
}

export interface LeaderboardEntry {
  rank: number;
  player: Player;
  streak: number;
  recentActivity: number;
}

export interface StoredLobbyPlayer extends Player {
  isCaptain?: boolean;
  team?: 'A' | 'B';
  draftOrder?: number;
  ready?: boolean;
}

export interface StoredLobby {
  id: string;
  name: string;
  gameType: string;
  players: StoredLobbyPlayer[];
  captainIds: string[];
  status: 'waiting' | 'drafting' | 'ready' | 'in-progress';
  createdBy: string;
  createdAt: Date;
  draftType: 'snake' | 'auction';
  maxPlayers: number;
  matchResult?: 'A' | 'B';
}