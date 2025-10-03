/**
 * CSV parsing utilities for match results and player data
 */

export interface CSVMatchData {
  player1Name: string;
  player2Name: string;
  winner: string;
  date: string;
  duration?: number;
  map?: string;
  gameType?: string;
}

export interface CSVPlayerData {
  name: string;
  elo: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  lastPlayed: string;
  joinDate: string;
}

export class CSVParser {
  /**
   * Parse CSV match data from string
   */
  static parseMatchData(csvText: string): CSVMatchData[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const matchData: any = {};
      
      headers.forEach((header, index) => {
        matchData[header] = values[index] || '';
      });
      
      return matchData as CSVMatchData;
    });
  }

  /**
   * Generate CSV from match data
   */
  static generateMatchCSV(matches: any[]): string {
    const headers = ['Match ID', 'Player 1', 'Player 2', 'Winner', 'Date', 'ELO Change', 'Duration', 'Map', 'Game Type'];
    const csvLines = [headers.join(',')];
    
    matches.forEach(match => {
      const row = [
        match.id,
        match.player1Name,
        match.player2Name,
        match.winnerId === match.player1Id ? match.player1Name : match.player2Name,
        new Date(match.date).toISOString().split('T')[0],
        match.player1EloChange,
        match.replayData?.duration || 'N/A',
        match.replayData?.map || 'N/A',
        match.gameType || 'zealot-hockey'
      ];
      csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
  }

  /**
   * Generate CSV from player data
   */
  static generatePlayerCSV(players: any[]): string {
    const headers = ['Name', 'ELO', 'Matches Played', 'Wins', 'Losses', 'Win Rate', 'Last Played', 'Join Date'];
    const csvLines = [headers.join(',')];
    
    players.forEach(player => {
      const row = [
        player.name,
        player.elo,
        player.matchesPlayed,
        player.wins,
        player.losses,
        player.winRate,
        new Date(player.lastPlayed).toISOString().split('T')[0],
        new Date(player.joinDate).toISOString().split('T')[0]
      ];
      csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
  }

  /**
   * Validate CSV structure for match data
   */
  static validateMatchCSV(csvText: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!csvText.trim()) {
      errors.push('CSV file is empty');
      return { isValid: false, errors };
    }
    
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      errors.push('CSV must contain at least one data row');
    }
    
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    const requiredHeaders = ['player1name', 'player2name', 'winner'];
    
    requiredHeaders.forEach(requiredHeader => {
      if (!headers.includes(requiredHeader)) {
        errors.push(`Missing required column: ${requiredHeader}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse CSV player data from string
   */
  static parsePlayerData(csvText: string): CSVPlayerData[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const playerData: any = {};
      
      headers.forEach((header, index) => {
        playerData[header] = values[index] || '';
      });
      
      return playerData as CSVPlayerData;
    });
  }

  /**
   * Validate CSV structure for player data
   */
  static validatePlayerCSV(csvText: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!csvText.trim()) {
      errors.push('CSV file is empty');
      return { isValid: false, errors };
    }
    
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      errors.push('CSV must contain at least one data row');
    }
    
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    const requiredHeaders = ['name', 'elo'];
    
    requiredHeaders.forEach(requiredHeader => {
      if (!headers.includes(requiredHeader)) {
        errors.push(`Missing required column: ${requiredHeader}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}