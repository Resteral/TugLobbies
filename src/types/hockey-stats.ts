/**
 * Type definitions for detailed hockey statistics
 */

export interface HockeyPlayerStats {
  id: string;
  team: string;
  handle: string;
  accountId: string;
  stealsTurnovers: number; // New field
  shots: number;
  goals: number;
  assists: number;
  pickups: number;
  passes: number;
  passesReceived: number;
  possession: number; // in seconds
  shotsAllowed: number;
  saves: number;
  goaltenderTime: number; // in seconds
  skaterTime: number; // in seconds
  matchId?: string;
  matchDate?: Date;
  totalTime?: number; // calculated field
  shootingPercentage?: number; // calculated field
  savePercentage?: number; // calculated field
  points?: number; // calculated field
  passCompletion?: number; // calculated field
  possessionPercentage?: number; // calculated field
}

export interface HockeyTeamStats {
  team: string;
  totalShots: number;
  totalGoals: number;
  totalAssists: number;
  totalPickups: number;
  totalPasses: number;
  totalPassesReceived: number;
  totalPossession: number;
  totalShotsAllowed: number;
  totalSaves: number;
  totalGoaltenderTime: number;
  totalSkaterTime: number;
  matchesPlayed: number;
  averageShots: number;
  averageGoals: number;
  shootingPercentage: number;
  savePercentage: number;
  passCompletion: number;
  possessionPercentage: number;
}

export interface HockeyMatchStats {
  id: string;
  date: Date;
  teamA: string;
  teamB: string;
  teamAScore: number;
  teamBScore: number;
  playerStats: HockeyPlayerStats[];
}