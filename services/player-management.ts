/**
 * Player Management Service
 * Handles player authentication, session management, and account ID generation
 */

import { Player } from '../types/zealot-hockey';

/**
 * Player Management Service
 * Singleton service for handling player authentication and data
 */
class PlayerManagementService {
  private static instance: PlayerManagementService;
  private currentPlayer: Player | null = null;
  private readonly STORAGE_KEY = 'tug-lobbies-current-player';

  private constructor() {
    this.loadFromStorage();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PlayerManagementService {
    if (!PlayerManagementService.instance) {
      PlayerManagementService.instance = new PlayerManagementService();
    }
    return PlayerManagementService.instance;
  }

  /**
   * Generate a new account ID in 1-S2-1-XXXXXX format
   */
  generateAccountId(): string {
    const uniqueId = 100000 + Math.floor(Math.random() * 900000);
    return `1-S2-1-${uniqueId}`;
  }

  /**
   * Create a new player account
   */
  createPlayer(name: string, accountId?: string): Player {
    const player: Player = {
      id: `player-${Date.now()}`,
      accountId: accountId || this.generateAccountId(),
      name: name.trim(),
      elo: 1200,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      lastPlayed: new Date(),
      joinDate: new Date(),
      gameStats: {}
    };

    this.currentPlayer = player;
    this.saveToStorage();
    return player;
  }

  /**
   * Login existing player
   */
  login(player: Player): void {
    this.currentPlayer = player;
    this.saveToStorage();
  }

  /**
   * Logout current player
   */
  logout(): void {
    this.currentPlayer = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get current player
   */
  getCurrentPlayer(): Player | null {
    return this.currentPlayer;
  }

  /**
   * Check if player is logged in
   */
  isLoggedIn(): boolean {
    return this.currentPlayer !== null;
  }

  /**
   * Update player statistics
   */
  updatePlayerStats(updates: Partial<Player>): void {
    if (this.currentPlayer) {
      this.currentPlayer = { ...this.currentPlayer, ...updates };
      this.saveToStorage();
    }
  }

  /**
   * Save player to localStorage
   */
  private saveToStorage(): void {
    if (this.currentPlayer) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentPlayer));
    }
  }

  /**
   * Load player from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const playerData = JSON.parse(stored);
        // Convert string dates back to Date objects
        playerData.lastPlayed = new Date(playerData.lastPlayed);
        playerData.joinDate = new Date(playerData.joinDate);
        this.currentPlayer = playerData;
      }
    } catch (error) {
      console.error('Error loading player from storage:', error);
      this.currentPlayer = null;
    }
  }

  /**
   * Validate account ID format (1-S2-1-XXXXXX)
   */
  validateAccountId(accountId: string): boolean {
    const pattern = /^1-S2-1-\\d{6}$/;
    return pattern.test(accountId);
  }

  /**
   * Find player by account ID
   */
  findPlayerByAccountId(accountId: string, players: Player[]): Player | null {
    return players.find(player => player.accountId === accountId) || null;
  }

  /**
   * Get all players (for leaderboard, etc.)
   */
  getAllPlayers(): Player[] {
    // In a real app, this would fetch from a database
    // For now, return mock data
    return [
      {
        id: '1',
        accountId: '1-S2-1-850006',
        name: 'ZealotMaster',
        elo: 1450,
        matchesPlayed: 25,
        wins: 18,
        losses: 7,
        winRate: 72,
        lastPlayed: new Date(),
        joinDate: new Date('2024-01-01'),
        gameStats: {}
      },
      {
        id: '2',
        accountId: '1-S2-1-850007',
        name: 'HockeyPro',
        elo: 1380,
        matchesPlayed: 22,
        wins: 15,
        losses: 7,
        winRate: 68,
        lastPlayed: new Date(),
        joinDate: new Date('2024-01-02'),
        gameStats: {}
      },
      {
        id: '3',
        accountId: '1-S2-1-850008',
        name: 'GoalGuardian',
        elo: 1420,
        matchesPlayed: 30,
        wins: 20,
        losses: 10,
        winRate: 67,
        lastPlayed: new Date(),
        joinDate: new Date('2024-01-03'),
        gameStats: {}
      }
    ];
  }
}

// Export singleton instance
export const playerManagement = PlayerManagementService.getInstance();