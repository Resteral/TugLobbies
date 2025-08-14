"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitScore(
  gameId: string,
  team1Score: number,
  team2Score: number,
  mvpVote?: string,
  flaggedPlayers?: string[],
  flagReasons?: any,
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to submit scores" }
  }

  try {
    // Get current user's player name
    const { data: playerData } = await supabase.from("player_stats").select("player_name").eq("id", user.id).single()

    if (!playerData) {
      return { error: "Player not found" }
    }

    // Get current game session
    const { data: gameSession } = await supabase.from("game_sessions").select("*").eq("id", gameId).single()

    if (!gameSession) {
      return { error: "Game session not found" }
    }

    // Submit score
    const { error: scoreError } = await supabase.from("score_submissions").insert({
      id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lobby_id: gameSession.lobby_id,
      player_name: playerData.player_name,
      team1_score: team1Score,
      team2_score: team2Score,
      mvp_vote: mvpVote || null,
      flagged_players: flaggedPlayers || [],
      flag_reasons: flagReasons || {},
    })

    if (scoreError) {
      console.error("Score submission error:", scoreError)
      return { error: "Failed to submit score" }
    }

    // Check if we have enough submissions to validate the score
    const { data: submissions } = await supabase
      .from("score_submissions")
      .select("*")
      .eq("lobby_id", gameSession.lobby_id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (submissions && submissions.length >= 3) {
      // Find consensus score (most common submission)
      const scoreMap = new Map()
      submissions.forEach((sub) => {
        const key = `${sub.team1_score}-${sub.team2_score}`
        scoreMap.set(key, (scoreMap.get(key) || 0) + 1)
      })

      const consensusScore = Array.from(scoreMap.entries()).reduce((a, b) => (a[1] > b[1] ? a : b))
      const [consensusTeam1, consensusTeam2] = consensusScore[0].split("-").map(Number)

      // Update game session with consensus score
      if (consensusScore[1] >= 2) {
        // At least 2 people agree
        await supabase
          .from("game_sessions")
          .update({
            team1_score: consensusTeam1,
            team2_score: consensusTeam2,
            status: consensusTeam1 !== consensusTeam2 ? "completed" : "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", gameId)
      }
    }

    revalidatePath(`/game/${gameId}`)
    return { success: true }
  } catch (error) {
    console.error("Submit score error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function submitPlayerStats(gameId: string, playerStats: any[]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get game session
    const { data: gameSession } = await supabase.from("game_sessions").select("*").eq("id", gameId).single()

    if (!gameSession) {
      return { error: "Game session not found" }
    }

    // Insert player stats
    const statsToInsert = playerStats.map((stat) => ({
      player_id: stat.playerId,
      game_date: new Date().toISOString().split("T")[0],
      team: stat.team,
      goals: stat.goals || 0,
      assists: stat.assists || 0,
      shots: stat.shots || 0,
      shots_against: stat.shotsAgainst || 0,
      save_amount: stat.saves || 0,
      passes: stat.passes || 0,
      passes_received: stat.passesReceived || 0,
      pickups: stat.pickups || 0,
      turnovers: stat.turnovers || 0,
      steals: stat.steals || 0,
      time_as_skater: stat.timeAsSkater || 0,
      time_as_goalie: stat.timeAsGoalie || 0,
      possession: stat.possession || 0,
      player_game_id: `${stat.playerId}_${gameId}`,
    }))

    const { error: statsError } = await supabase.from("game_stats").insert(statsToInsert)

    if (statsError) {
      console.error("Stats submission error:", statsError)
      return { error: "Failed to submit player stats" }
    }

    return { success: true }
  } catch (error) {
    console.error("Submit player stats error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function flagPlayer(gameId: string, playerName: string, reason: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get flagged player's ID
    const { data: flaggedPlayer } = await supabase
      .from("player_stats")
      .select("id")
      .eq("player_name", playerName)
      .single()

    if (!flaggedPlayer) {
      return { error: "Player not found" }
    }

    // Get current user's player name
    const { data: flaggerPlayer } = await supabase.from("player_stats").select("player_name").eq("id", user.id).single()

    // Check if flag already exists
    const { data: existingFlag } = await supabase
      .from("player_flags")
      .select("*")
      .eq("player_id", flaggedPlayer.id)
      .eq("game_id", gameId)
      .single()

    if (existingFlag) {
      // Add to existing flag
      const updatedFlaggedBy = [...(existingFlag.flagged_by || []), flaggerPlayer?.player_name].filter(
        (name, index, arr) => arr.indexOf(name) === index,
      )

      await supabase.from("player_flags").update({ flagged_by: updatedFlaggedBy }).eq("id", existingFlag.id)
    } else {
      // Create new flag
      await supabase.from("player_flags").insert({
        player_id: flaggedPlayer.id,
        game_id: gameId,
        reason,
        flagged_by: [flaggerPlayer?.player_name],
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Flag player error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function awardMerit(gameId: string, playerName: string, reason: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get merit player's ID
    const { data: meritPlayer } = await supabase
      .from("player_stats")
      .select("id")
      .eq("player_name", playerName)
      .single()

    if (!meritPlayer) {
      return { error: "Player not found" }
    }

    // Get current user's player name
    const { data: awarderPlayer } = await supabase.from("player_stats").select("player_name").eq("id", user.id).single()

    // Check if merit already exists
    const { data: existingMerit } = await supabase
      .from("player_merits")
      .select("*")
      .eq("player_id", meritPlayer.id)
      .eq("game_id", gameId)
      .single()

    if (existingMerit) {
      // Add to existing merit
      const updatedMeritedBy = [...(existingMerit.merited_by || []), awarderPlayer?.player_name].filter(
        (name, index, arr) => arr.indexOf(name) === index,
      )

      await supabase.from("player_merits").update({ merited_by: updatedMeritedBy }).eq("id", existingMerit.id)
    } else {
      // Create new merit
      await supabase.from("player_merits").insert({
        player_id: meritPlayer.id,
        game_id: gameId,
        reason,
        merited_by: [awarderPlayer?.player_name],
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Award merit error:", error)
    return { error: "An unexpected error occurred" }
  }
}
