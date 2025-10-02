/**
 * Supabase Authentication Service
 * Handles user authentication and session management
 */

import { supabase } from '../lib/supabase'

export interface UserProfile {
  id: string
  name: string
  email?: string
  discord_id?: string
  elo: number
  matches_played: number
  wins: number
  losses: number
  win_rate: number
  join_date: string
}

export class SupabaseAuthService {
  private static instance: SupabaseAuthService

  public static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService()
    }
    return SupabaseAuthService.instance
  }

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, name: string): Promise<{ user: any; error: any }> {
    try {
      // Mock signup for demo - no real Supabase connection
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        user_metadata: { name }
      }
      
      // Create player profile with mock user
      await this.createPlayerProfile(mockUser.id, name, email)
      
      return { user: mockUser, error: null }

      if (data.user && !error) {
        // Create player profile
        await this.createPlayerProfile(data.user.id, name, email)
      }

      return { user: data.user, error }
    } catch (error) {
      console.error('Error signing up:', error)
      return { user: null, error }
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { user: data.user, error }
    } catch (error) {
      console.error('Error signing in:', error)
      return { user: null, error }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error }
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<any> {
    try {
      // Return mock user for demo
      return {
        id: 'demo-user-123',
        email: 'demo@example.com',
        user_metadata: { name: 'Demo Player' }
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Create player profile
   */
  async createPlayerProfile(userId: string, name: string, email?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('players')
        .insert({
          id: userId,
          name,
          email,
          elo: 1200,
          matches_played: 0,
          wins: 0,
          losses: 0,
          win_rate: 0,
          join_date: new Date().toISOString(),
        })

      return !error
    } catch (error) {
      console.error('Error creating player profile:', error)
      return false
    }
  }

  /**
   * Get player profile
   */
  async getPlayerProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) return null

      return data as UserProfile
    } catch (error) {
      console.error('Error getting player profile:', error)
      return null
    }
  }

  /**
   * Update player profile
   */
  async updatePlayerProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', userId)

      return !error
    } catch (error) {
      console.error('Error updating player profile:', error)
      return false
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }
}

export const supabaseAuth = SupabaseAuthService.getInstance()