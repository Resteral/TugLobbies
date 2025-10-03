/**
 * Custom hook for Discord Activity SDK integration
 * Handles Discord rich presence updates for tournament activities
 */

import { useState, useEffect, useCallback } from 'react';
import { discordService } from '../services/discord-service';

interface DiscordActivityState {
  isConnected: boolean;
  activityStatus: string;
  currentActivity: any;
}

interface TournamentActivityData {
  tournamentName: string;
  gameType: string;
  playerCount: number;
  maxPlayers: number;
  status: 'registration' | 'drafting' | 'live' | 'completed';
  currentRound?: number;
  totalRounds?: number;
}

/**
 * Hook for managing Discord activity updates
 */
export const useDiscordActivity = () => {
  const [activityState, setActivityState] = useState<DiscordActivityState>({
    isConnected: false,
    activityStatus: 'Initializing...',
    currentActivity: null
  });

  /**
   * Update Discord activity for tournament events
   */
  const updateTournamentActivity = useCallback((data: TournamentActivityData) => {
    try {
      const activity = discordService.generateTournamentActivity(data);
      
      setActivityState(prev => ({
        ...prev,
        currentActivity: activity,
        activityStatus: 'Activity updated successfully!'
      }));

      // In a real implementation, this would send to Discord SDK
      console.log('Discord Activity Update:', activity);
      
      return true;
    } catch (error) {
      console.error('Error updating Discord activity:', error);
      setActivityState(prev => ({
        ...prev,
        activityStatus: 'Failed to update activity'
      }));
      return false;
    }
  }, []);

  /**
   * Clear current Discord activity
   */
  const clearActivity = useCallback(() => {
    setActivityState(prev => ({
      ...prev,
      currentActivity: null,
      activityStatus: 'Activity cleared'
    }));
    
    console.log('Discord Activity Cleared');
    return true;
  }, []);

  /**
   * Generate specific activity for tournament drafting
   */
  const updateDraftActivity = useCallback((tournamentName: string, draftType: string, currentPick: number, totalPicks: number) => {
    return updateTournamentActivity({
      tournamentName,
      gameType: 'Zealot Hockey',
      playerCount: currentPick,
      maxPlayers: totalPicks,
      status: 'drafting',
      currentRound: Math.ceil(currentPick / 8), // Assuming 8 picks per round
      totalRounds: Math.ceil(totalPicks / 8)
    });
  }, [updateTournamentActivity]);

  /**
   * Generate specific activity for live tournament
   */
  const updateLiveTournamentActivity = useCallback((tournamentName: string, currentRound: number, totalRounds: number, playerCount: number) => {
    return updateTournamentActivity({
      tournamentName,
      gameType: 'Zealot Hockey',
      playerCount,
      maxPlayers: playerCount,
      status: 'live',
      currentRound,
      totalRounds
    });
  }, [updateTournamentActivity]);

  // Simulate Discord SDK connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setActivityState(prev => ({
        ...prev,
        isConnected: true,
        activityStatus: 'Discord Activity Ready!'
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    ...activityState,
    updateTournamentActivity,
    updateDraftActivity,
    updateLiveTournamentActivity,
    clearActivity
  };
};