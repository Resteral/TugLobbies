/**
 * Discord OAuth Service
 * Handles Discord OAuth2 authentication flow
 */

import { discordService } from './discord-service'

export interface DiscordOAuthConfig {
  clientId: string
  redirectUri: string
  scope: string[]
}

export class DiscordOAuthService {
  private static instance: DiscordOAuthService
  private config: DiscordOAuthConfig

  private constructor() {
    this.config = {
      clientId: '1422066214666244227', // Mock Discord client ID for demo
      redirectUri: `${window.location.origin}/auth/callback`,
      scope: ['identify', 'email', 'guilds', 'bot']
    }
  }

  public static getInstance(): DiscordOAuthService {
    if (!DiscordOAuthService.instance) {
      DiscordOAuthService.instance = new DiscordOAuthService()
    }
    return DiscordOAuthService.instance
  }

  /**
   * Generate Discord OAuth URL
   */
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' '),
      ...(state && { state })
    })

    return `https://discord.com/oauth2/authorize?${params.toString()}`
  }

  /**
   * Start Discord OAuth flow
   */
  startOAuthFlow(state?: string): void {
    const authUrl = this.generateAuthUrl(state)
    window.location.href = authUrl
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(code: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // In a real implementation, you would send the code to your backend
      // to exchange it for an access token securely
      
      // For demo purposes, we'll simulate the process
      const mockDiscordUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: 'DemoUser',
        discriminator: '1234',
        avatar: null,
        email: 'demo@example.com'
      }

      // Log the activity
      await discordService.logBotActivity('oauth_callback', {
        code,
        success: true,
        userId: mockDiscordUser.id
      })

      return {
        success: true,
        user: mockDiscordUser
      }
    } catch (error) {
      console.error('Error handling Discord OAuth callback:', error)
      
      await discordService.logBotActivity('oauth_callback_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        success: false,
        error: 'Failed to authenticate with Discord'
      }
    }
  }

  /**
   * Link Discord account to player
   */
  async linkDiscordAccount(playerId: string, discordUser: any, accessToken?: string): Promise<boolean> {
    try {
      return await discordService.linkDiscordAccount(playerId, {
        id: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        accessToken,
        refreshToken: undefined // In real implementation, store refresh token securely
      })
    } catch (error) {
      console.error('Error linking Discord account:', error)
      return false
    }
  }

  /**
   * Get OAuth configuration
   */
  getConfig(): DiscordOAuthConfig {
    return this.config
  }

  /**
   * Check if Discord OAuth is configured
   */
  isConfigured(): boolean {
    return !!this.config.clientId && this.config.clientId !== 'your_discord_client_id_here'
  }
}

export const discordOAuth = DiscordOAuthService.getInstance()