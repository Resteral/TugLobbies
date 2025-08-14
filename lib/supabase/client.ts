import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export const createClient = () => createClientComponentClient()

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClientComponentClient()

// Database types for TypeScript
export interface Player {
  id: string
  user_id: string
  username: string
  display_name: string
  email: string
  elo_rating: number
  games_played: number
  wins: number
  losses: number
  goals: number
  assists: number
  saves: number
  position: "Forward" | "Defense" | "Goalie"
  avatar_url?: string
  bio?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  captain_id?: string
  tournament_id?: string
  league_id?: string
  team_type: "draft" | "auction" | "tournament"
  color: string
  logo_url?: string
  created_at: string
  updated_at: string
  captain?: Player
  members?: TeamMember[]
}

export interface TeamMember {
  id: string
  team_id: string
  player_id: string
  position?: string
  is_captain: boolean
  joined_at: string
  player?: Player
}

export interface Tournament {
  id: string
  name: string
  description?: string
  tournament_type: "bracket" | "round_robin" | "swiss"
  max_teams: number
  entry_fee: number
  prize_pool: number
  status: "upcoming" | "active" | "completed" | "cancelled"
  start_date?: string
  end_date?: string
  registration_deadline?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  tournament_id?: string
  league_id?: string
  team1_id: string
  team2_id: string
  team1_score: number
  team2_score: number
  status: "scheduled" | "live" | "completed" | "cancelled"
  scheduled_at?: string
  started_at?: string
  ended_at?: string
  game_type: string
  duration_minutes: number
  created_at: string
  updated_at: string
  team1?: Team
  team2?: Team
  events?: GameEvent[]
}

export interface GameEvent {
  id: string
  game_id: string
  player_id: string
  team_id: string
  event_type: "goal" | "assist" | "save" | "penalty"
  event_time: number
  description?: string
  recorded_by?: string
  created_at: string
  player?: Player
  team?: Team
}

export interface AuctionLeague {
  id: string
  name: string
  description?: string
  budget_cap: number
  max_teams: number
  draft_date?: string
  season_start?: string
  season_end?: string
  status: "setup" | "drafting" | "active" | "completed"
  created_by?: string
  created_at: string
  updated_at: string
}
