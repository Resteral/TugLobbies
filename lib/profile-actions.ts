"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePlayerProfile(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to update your profile" }
  }

  const playerName = formData.get("playerName")

  if (!playerName) {
    return { error: "Player name is required" }
  }

  try {
    // Check if name is already taken by another player
    const { data: existingPlayer } = await supabase
      .from("player_stats")
      .select("id")
      .eq("player_name", playerName.toString())
      .neq("id", user.id)
      .single()

    if (existingPlayer) {
      return { error: "Player name is already taken" }
    }

    // Update player_stats table
    const { error: statsError } = await supabase
      .from("player_stats")
      .update({ player_name: playerName.toString() })
      .eq("id", user.id)

    if (statsError) {
      return { error: "Failed to update player stats" }
    }

    // Update players table
    const { error: playersError } = await supabase
      .from("players")
      .update({ name: playerName.toString() })
      .eq("id", user.id)

    if (playersError) {
      console.error("Players table update error:", playersError)
    }

    revalidatePath("/profile")
    return { success: "Profile updated successfully" }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getPlayerGameHistory(playerId: string) {
  const supabase = createClient()

  try {
    // Get player name
    const { data: playerData } = await supabase.from("player_stats").select("player_name").eq("id", playerId).single()

    if (!playerData) {
      return { error: "Player not found" }
    }

    // Get game sessions where player participated
    const { data: gameSessions } = await supabase
      .from("game_sessions")
      .select("*")
      .or(`team1.cs.{${playerData.player_name}},team2.cs.{${playerData.player_name}}`)
      .order("created_at", { ascending: false })
      .limit(20)

    // Get detailed game stats
    const { data: gameStats } = await supabase
      .from("game_stats")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })
      .limit(20)

    return { gameSessions: gameSessions || [], gameStats: gameStats || [] }
  } catch (error) {
    console.error("Get game history error:", error)
    return { error: "Failed to fetch game history" }
  }
}

export async function getPlayerAchievements(playerId: string) {
  const supabase = createClient()

  try {
    // Get merits
    const { data: merits } = await supabase
      .from("player_merits")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })

    // Get flags (for transparency)
    const { data: flags } = await supabase
      .from("player_flags")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })

    return { merits: merits || [], flags: flags || [] }
  } catch (error) {
    console.error("Get achievements error:", error)
    return { error: "Failed to fetch achievements" }
  }
}
