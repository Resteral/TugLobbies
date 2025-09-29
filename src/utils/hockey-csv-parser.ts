/**
 * CSV parsing utilities for detailed hockey statistics
 */

import { HockeyPlayerStats } from '../types/hockey-stats';

export interface CSCHockeyStatsData {
  team: string;
  handle: string;
  accountId: string;
  shots: string;
  goals: string;
  assists: string;
  pickups: string;
  passes: string;
  passesReceived: string;
  possession: string;
  shotsAllowed: string;
  saves: string;
  goaltenderTime: string;
  skaterTime: string;
}

export class HockeyCSVParser {
  /**
   * Parse CSV hockey stats data from string
   */
  static parseHockeyStatsData(csvText: string): CSCHockeyStatsData[] {
    const lines = csvText.trim().split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith(','));
    
    console.log('=== PARSING HOCKEY DATA ===');
    console.log('Total lines:', lines.length);
    console.log('First line:', lines[0]);
    
    // Check if first line is header or data
    const firstLine = lines[0].split(',').map(v => v.trim());
    const hasHeader = firstLine.some(header => 
      ['team', 'handle', 'accountid', 'shots', 'goals'].includes(header.toLowerCase())
    );
    
    let headers: string[];
    let dataLines: string[];
    
    if (hasHeader) {
      headers = firstLine.map(header => header.trim().toLowerCase().replace(/\s+/g, ''));
      dataLines = lines.slice(1);
    } else {
      // No header - use default column mapping
      headers = ['team', 'accountid', 'shots', 'goals', 'assists', 'pickups', 'passes', 'passesreceived', 'possession', 'shotsallowed', 'saves', 'goaltendertime', 'skatertime', 'handle'];
      dataLines = lines;
    }
    
    console.log('Headers:', headers);
    console.log('Data lines count:', dataLines.length);
    
    return dataLines.map((line, lineIndex) => {
      // Clean the line - remove leading commas and trim
      let cleanLine = line;
      if (cleanLine.startsWith(',')) {
        cleanLine = cleanLine.substring(1).trim();
      }
      
      const values = cleanLine.split(',').map(value => value.trim());
      console.log(`Line ${lineIndex + 1}:`, values);
      
      const statsData: any = {};
      
      headers.forEach((header, index) => {
        if (index < values.length) {
          statsData[header] = values[index] || '';
        } else {
          statsData[header] = '';
        }
      });
      
      // Generate handle if not provided
      if (!statsData.handle && statsData.accountid) {
        statsData.handle = `Player_${statsData.accountid.split('-').pop()}`;
      }
      
      console.log('Parsed stats:', statsData);
      return statsData as CSCHockeyStatsData;
    });
  }

  /**
   * Generate CSV from hockey stats data
   */
  static generateHockeyStatsCSV(stats: HockeyPlayerStats[]): string {
    const headers = [
      'Team', 'Handle', 'AccountID', 'Shots', 'Goals', 'Assists', 
      'Pickups', 'Passes', 'PassesReceived', 'Possession', 
      'ShotsAllowed', 'Saves', 'GoaltenderTime', 'SkaterTime'
    ];
    
    const csvLines = [headers.join(',')];
    
    stats.forEach(stat => {
      const row = [
        stat.team,
        stat.handle,
        stat.accountId,
        stat.shots.toString(),
        stat.goals.toString(),
        stat.assists.toString(),
        stat.pickups.toString(),
        stat.passes.toString(),
        stat.passesReceived.toString(),
        stat.possession.toString(),
        stat.shotsAllowed.toString(),
        stat.saves.toString(),
        stat.goaltenderTime.toString(),
        stat.skaterTime.toString()
      ];
      csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
  }

  /**
   * Convert parsed CSV data to HockeyPlayerStats
   */
  static convertToHockeyStats(csvData: CSCHockeyStatsData[], matchId?: string): HockeyPlayerStats[] {
    return csvData.map((data, index) => {
      const totalTime = (parseInt(data.goaltenderTime) || 0) + (parseInt(data.skaterTime) || 0);
      const shootingPercentage = parseInt(data.shots) > 0 ? 
        (parseInt(data.goals) / parseInt(data.shots)) * 100 : 0;
      const savePercentage = parseInt(data.shotsAllowed) > 0 ? 
        (parseInt(data.saves) / parseInt(data.shotsAllowed)) * 100 : 0;
      const points = parseInt(data.goals) + parseInt(data.assists);
      const passCompletion = parseInt(data.passes) > 0 ? 
        (parseInt(data.passesReceived) / parseInt(data.passes)) * 100 : 0;
      const possessionPercentage = totalTime > 0 ? 
        (parseInt(data.possession) / totalTime) * 100 : 0;

      return {
        id: `player-stat-${index}-${Date.now()}`,
        team: data.team,
        handle: data.handle,
        accountId: data.accountId,
        shots: parseInt(data.shots) || 0,
        goals: parseInt(data.goals) || 0,
        assists: parseInt(data.assists) || 0,
        pickups: parseInt(data.pickups) || 0,
        passes: parseInt(data.passes) || 0,
        passesReceived: parseInt(data.passesReceived) || 0,
        possession: parseInt(data.possession) || 0,
        shotsAllowed: parseInt(data.shotsAllowed) || 0,
        saves: parseInt(data.saves) || 0,
        goaltenderTime: parseInt(data.goaltenderTime) || 0,
        skaterTime: parseInt(data.skaterTime) || 0,
        matchId,
        matchDate: new Date(),
        totalTime,
        shootingPercentage,
        savePercentage,
        points,
        passCompletion,
        possessionPercentage,
        stealsTurnovers: 0 // Default value for new field
      };
    });
  }

  /**
   * Validate CSV structure for hockey stats
   */
  static validateHockeyStatsCSV(csvText: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!csvText.trim()) {
      errors.push('CSV file is empty');
      return { isValid: false, errors };
    }
    
    const lines = csvText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length < 1) {
      errors.push('CSV must contain at least one player data row');
    }
    
    // Check if each line has sufficient columns
    lines.forEach((line, index) => {
      let cleanLine = line;
      if (cleanLine.startsWith(',')) {
        cleanLine = cleanLine.substring(1).trim();
      }
      
      const values = cleanLine.split(',').map(value => value.trim());
      if (values.length < 13) {
        errors.push(`Line ${index + 1}: Expected at least 13 columns for player data but found ${values.length}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate team statistics from player stats
   */
  static calculateTeamStats(playerStats: HockeyPlayerStats[]): any {
    const teams = [...new Set(playerStats.map(stat => stat.team))];
    
    return teams.map(team => {
      const teamStats = playerStats.filter(stat => stat.team === team);
      const totalShots = teamStats.reduce((sum, stat) => sum + stat.shots, 0);
      const totalGoals = teamStats.reduce((sum, stat) => sum + stat.goals, 0);
      const totalAssists = teamStats.reduce((sum, stat) => sum + stat.assists, 0);
      const totalPickups = teamStats.reduce((sum, stat) => sum + stat.pickups, 0);
      const totalPasses = teamStats.reduce((sum, stat) => sum + stat.passes, 0);
      const totalPassesReceived = teamStats.reduce((sum, stat) => sum + stat.passesReceived, 0);
      const totalPossession = teamStats.reduce((sum, stat) => sum + stat.possession, 0);
      const totalShotsAllowed = teamStats.reduce((sum, stat) => sum + stat.shotsAllowed, 0);
      const totalSaves = teamStats.reduce((sum, stat) => sum + stat.saves, 0);
      const totalGoaltenderTime = teamStats.reduce((sum, stat) => sum + stat.goaltenderTime, 0);
      const totalSkaterTime = teamStats.reduce((sum, stat) => sum + stat.skaterTime, 0);
      
      const shootingPercentage = totalShots > 0 ? (totalGoals / totalShots) * 100 : 0;
      const savePercentage = totalShotsAllowed > 0 ? (totalSaves / totalShotsAllowed) * 100 : 0;
      const passCompletion = totalPasses > 0 ? (totalPassesReceived / totalPasses) * 100 : 0;
      const totalTime = totalGoaltenderTime + totalSkaterTime;
      const possessionPercentage = totalTime > 0 ? (totalPossession / totalTime) * 100 : 0;

      return {
        team,
        totalShots,
        totalGoals,
        totalAssists,
        totalPickups,
        totalPasses,
        totalPassesReceived,
        totalPossession,
        totalShotsAllowed,
        totalSaves,
        totalGoaltenderTime,
        totalSkaterTime,
        matchesPlayed: 1, // This would need to be calculated across multiple matches
        averageShots: totalShots,
        averageGoals: totalGoals,
        shootingPercentage,
        savePercentage,
        passCompletion,
        possessionPercentage
      };
    });
  }
}