"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function initializeDraft(lobbyId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get all players in the lobby with their ELO ratings
    const { data: lobbyPlayers } = await supabase.from("lobby_players").select("player_name").eq("lobby_id", lobbyId)

    if (!lobbyPlayers || lobbyPlayers.length < 4) {
      return { error: "Need at least 4 players to start draft" }
    }

    // Get ELO ratings for all players
    const playerNames = lobbyPlayers.map((p) => p.player_name)
    const { data: playerStats } = await supabase
      .from("player_stats")
      .select("player_name, elo")
      .in("player_name", playerNames)
      .order("elo", { ascending: false })

    if (!playerStats || playerStats.length < 4) {
      return { error: "Could not fetch player stats" }
    }

    // Select top 2 ELO players as captains
    const captain1 = playerStats[0].player_name
    const captain2 = playerStats[1].player_name

    // Remaining players available for draft
    const availablePlayers = playerStats.slice(2).map((p) => p.player_name)

    // Create draft state
    const { error: draftError } = await supabase.from("draft_state").insert({
      id: `draft_${lobbyId}`,
      lobby_id: lobbyId,
      captain1,
      captain2,
      available_players: availablePlayers,
      team1: [captain1],
      team2: [captain2],
      current_picker: captain1,
      pick_number: 1,
      is_complete: false,
    })

    if (draftError) {
      console.error("Draft creation error:", draftError)
      return { error: "Failed to initialize draft" }
    }

    // Update lobby status
    await supabase.from("lobbies").update({ status: "drafting" }).eq("id", lobbyId)

    return { success: true, captain1, captain2 }
  } catch (error) {
    console.error("Initialize draft error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function draftPlayer(lobbyId: string, playerName: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get current draft state
    const { data: draftState } = await supabase.from("draft_state").select("*").eq("lobby_id", lobbyId).single()

    if (!draftState) {
      return { error: "Draft not found" }
    }

    // Get current user's player name
    const { data: currentPlayer } = await supabase.from("player_stats").select("player_name").eq("id", user.id).single()

    if (!currentPlayer) {
      return { error: "Player not found" }
    }

    // Check if it's the current player's turn
    if (currentPlayer.player_name !== draftState.current_picker) {
      return { error: "It's not your turn to pick" }
    }

    // Check if player is available
    if (!draftState.available_players.includes(playerName)) {
      return { error: "Player not available for draft" }
    }

    // Determine which team is picking
    const isTeam1Pick = draftState.current_picker === draftState.captain1
    const updatedTeam1 = isTeam1Pick ? [...draftState.team1, playerName] : draftState.team1
    const updatedTeam2 = !isTeam1Pick ? [...draftState.team2, playerName] : draftState.team2
    const updatedAvailablePlayers = draftState.available_players.filter((p: string) => p !== playerName)

    // Determine next picker (alternating)
    const nextPicker = draftState.current_picker === draftState.captain1 ? draftState.captain2 : draftState.captain1

    // Check if draft is complete
    const isComplete = updatedAvailablePlayers.length === 0

    // Update draft state
    const { error: updateError } = await supabase
      .from("draft_state")
      .update({
        team1: updatedTeam1,
        team2: updatedTeam2,
        available_players: updatedAvailablePlayers,
        current_picker: isComplete ? null : nextPicker,
        pick_number: draftState.pick_number + 1,
        is_complete: isComplete,
      })
      .eq("lobby_id", lobbyId)

    if (updateError) {
      return { error: "Failed to update draft" }
    }

    // Record the draft pick
    await supabase.from("draft_picks").insert({
      lobby_id: lobbyId,
      player_name: currentPlayer.player_name,
      player_picked: playerName,
      pick_number: draftState.pick_number,
    })

    // Record draft action
    await supabase.from("draft_actions").insert({
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lobby_id: lobbyId,
      action_type: "pick",
      player_name: currentPlayer.player_name,
      target_player: playerName,
      pick_number: draftState.pick_number,
      team_assignment: isTeam1Pick ? "team1" : "team2",
    })

    if (isComplete) {
      // Update lobby status to ready for game
      await supabase.from("lobbies").update({ status: "ready" }).eq("id", lobbyId)
    }

    revalidatePath(`/draft/${lobbyId}`)
    return { success: true, isComplete }
  } catch (error) {
    console.error("Draft player error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function startGameFromDraft(lobbyId: string) {
  const supabase = createClient()

  try {
    // Get draft state
    const { data: draftState } = await supabase.from("draft_state").select("*").eq("lobby_id", lobbyId).single()

    if (!draftState || !draftState.is_complete) {
      return { error: "Draft not complete" }
    }

    // Create game session
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const { error: gameError } = await supabase.from("game_sessions").insert({
      id: gameId,
      lobby_id: lobbyId,
      team1: draftState.team1,
      team2: draftState.team2,
      team1_score: 0,
      team2_score: 0,
      status: "active",
    })

    if (gameError) {
      return { error: "Failed to create game session" }
    }

    // Update lobby status
    await supabase.from("lobbies").update({ status: "in_game" }).eq("id", lobbyId)

    return { success: true, gameId }
  } catch (error) {
    console.error("Start game error:", error)
    return { error: "An unexpected error occurred" }
  }
}
