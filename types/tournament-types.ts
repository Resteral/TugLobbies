/**
 * Tournament type definitions for draft systems and leagues
 */

export type DraftType = 'auction' | 'snake' | 'random';
export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss' | 'league';
export type TournamentStatus = 'registration' | 'drafting' | 'live' | 'completed' | 'upcoming';

export interface TournamentPlayer {
  id: string;
  accountId: string;
  name: string;
  elo: number;
  team?: string;
  budget?: number;
  draftedPlayers: string[];
  isCaptain?: boolean;
}

export interface DraftPlayer {
  id: string;
  accountId: string;
  name: string;
  elo: number;
  position: string;
  baseValue: number;
  currentBid?: number;
  currentBidder?: string;
  sold: boolean;
  soldPrice?: number;
  soldTo?: string;
}

export interface AuctionBid {
  playerId: string;
  bidderId: string;
  bidAmount: number;
  timestamp: Date;
}

export interface DraftPick {
  round: number;
  pickNumber: number;
  playerId: string;
  teamId: string;
  timestamp: Date;
}

export interface LeagueSettings {
  seasonStart: string;
  seasonEnd: string;
  maxTeams: number;
  teamOwnersEnabled: boolean;
  buyInEnabled: boolean;
  buyInAmount: number;
  draftType: DraftType;
  salaryCap: number;
  rosterSize: number;
}

export interface Tournament {
  id: string;
  name: string;
  gameType: string;
  format: TournamentFormat;
  status: TournamentStatus;
  draftType: DraftType;
  prizePool: number;
  entryFee: number;
  maxPlayers: number;
  currentPlayers: number;
  startDate: string;
  endDate: string;
  organizer: string;
  description: string;
  rules: string[];
  leagueSettings?: LeagueSettings;
  players: TournamentPlayer[];
  draftPlayers?: DraftPlayer[];
  currentRound?: number;
  currentPick?: number;
  auctionBids?: AuctionBid[];
  draftPicks?: DraftPick[];
}