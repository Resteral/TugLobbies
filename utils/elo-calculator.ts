/**
 * ELO rating system calculator for TUG Lobbies
 */

export class EloCalculator {
  private static readonly K_FACTOR = 32;
  private static readonly STARTING_ELO = 1200;

  /**
   * Calculate new ELO ratings after a match
   */
  static calculateNewRatings(
    player1Elo: number,
    player2Elo: number,
    player1Won: boolean
  ): { newPlayer1Elo: number; newPlayer2Elo: number; eloChange: number } {
    const expectedScore1 = this.getExpectedScore(player1Elo, player2Elo);
    const expectedScore2 = this.getExpectedScore(player2Elo, player1Elo);
    
    const actualScore1 = player1Won ? 1 : 0;
    const actualScore2 = player1Won ? 0 : 1;
    
    const newPlayer1Elo = Math.round(player1Elo + this.K_FACTOR * (actualScore1 - expectedScore1));
    const newPlayer2Elo = Math.round(player2Elo + this.K_FACTOR * (actualScore2 - expectedScore2));
    
    const eloChange = player1Won 
      ? newPlayer1Elo - player1Elo 
      : newPlayer2Elo - player2Elo;

    return {
      newPlayer1Elo,
      newPlayer2Elo,
      eloChange: Math.abs(eloChange)
    };
  }

  /**
   * Calculate expected score based on ELO difference
   */
  private static getExpectedScore(playerElo: number, opponentElo: number): number {
    return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  }

  /**
   * Get starting ELO for new players
   */
  static getStartingElo(): number {
    return this.STARTING_ELO;
  }

  /**
   * Calculate win probability between two players
   */
  static getWinProbability(player1Elo: number, player2Elo: number): number {
    return this.getExpectedScore(player1Elo, player2Elo) * 100;
  }
}