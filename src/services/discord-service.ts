/**
 * Discord integration service for TUG Lobbies
 * Handles bot commands, rich presence, and user authentication
 */

import { supabase, TABLES } from '../lib/supabase'

// Mock Discord functionality since we can't install real Discord SDK

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar?: string
  guilds?: string[]
  accessToken?: string
  refreshToken?: string
}

export interface DiscordActivity {
  type: 'playing' | 'streaming' | 'listening' | 'watching'
  name: string
  details?: string
  state?: string
  startTimestamp?: number
  endTimestamp?: number
  largeImageKey?: string
  largeImageText?: string
  smallImageKey?: string
  smallImageText?: string
}

export class DiscordService {
  private static instance: DiscordService
  private botInviteUrl = 'https://discord.com/oauth2/authorize?client_id=1422066214666244227&permissions=550158526548&integration_type=0&scope=bot+applications.commands'

  public static getInstance(): DiscordService {
    if (!DiscordService.instance) {
      DiscordService.instance = new DiscordService()
    }
    return DiscordService.instance
  }

  /**
   * Get Discord bot invite URL
   */
  getBotInviteUrl(): string {
    return this.botInviteUrl
  }

  /**
   * Link Discord account to player profile
   */
  async linkDiscordAccount(playerId: string, discordUser: DiscordUser): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.DISCORD_USERS)
        .upsert({
          player_id: playerId,
          discord_id: discordUser.id,
          discord_username: discordUser.username,
          discord_discriminator: discordUser.discriminator,
          discord_avatar: discordUser.avatar,
          access_token: discordUser.accessToken,
          refresh_token: discordUser.refreshToken,
          updated_at: new Date().toISOString()
        })

      return !error
    } catch (error) {
      console.error('Error linking Discord account:', error)
      return false
    }
  }

  /**
   * Get Discord user by player ID
   */
  async getDiscordUser(playerId: string): Promise<DiscordUser | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.DISCORD_USERS)
        .select('*')
        .eq('player_id', playerId)
        .single()

      if (error || !data) return null

      return {
        id: data.discord_id,
        username: data.discord_username,
        discriminator: data.discord_discriminator,
        avatar: data.discord_avatar
      }
    } catch (error) {
      console.error('Error getting Discord user:', error)
      return null
    }
  }

  /**
   * Create rich presence activity for Discord
   */
  createRichPresence(activity: DiscordActivity): any {
    return {
      activities: [activity],
      status: 'online',
      afk: false
    }
  }

  /**
   * Generate lobby activity for Discord rich presence
   */
  generateLobbyActivity(lobbyName: string, gameType: string, playerCount: number, maxPlayers: number): DiscordActivity {
    return {
      type: 'playing',
      name: 'TUG Lobbies',
      details: `In ${lobbyName}`,
      state: `${playerCount}/${maxPlayers} players - ${gameType}`,
      startTimestamp: Date.now(),
      largeImageKey: 'tug_lobbies_logo',
      largeImageText: 'TUG Lobbies - StarCraft II Matchmaking',
      smallImageKey: gameType.includes('hockey') ? 'zealot_hockey' : 'sc2_icon',
      smallImageText: gameType
    }
  }

  /**
   * Generate queue activity for Discord rich presence
   */
  generateQueueActivity(gameType: string, position: number, waitTime: string): DiscordActivity {
    return {
      type: 'playing',
      name: 'TUG Lobbies',
      details: `In Queue: ${gameType}`,
      state: `Position: ${position} • Wait: ${waitTime}`,
      startTimestamp: Date.now(),
      largeImageKey: 'tug_lobbies_logo',
      largeImageText: 'Waiting for match...'
    }
  }

  /**
   * Log Discord bot activity
   */
  async logBotActivity(action: string, details: any): Promise<void> {
    try {
      await supabase
        .from(TABLES.ACTIVITY_LOGS)
        .insert({
          type: 'discord_bot',
          action,
          details,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging Discord activity:', error)
    }
  }

  /**
   * Get recent Discord bot activities
   */
  async getRecentActivities(limit = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.ACTIVITY_LOGS)
        .select('*')
        .eq('type', 'discord_bot')
        .order('created_at', { ascending: false })
        .limit(limit)

      return data || []
    } catch (error) {
      console.error('Error getting recent activities:', error)
      return []
    }
  }
}

export const discordService = DiscordService.getInstance()
