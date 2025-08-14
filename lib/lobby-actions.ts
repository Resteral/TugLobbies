"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createLobby(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a lobby" }
  }

  const name = formData.get("name")
  const isPrivate = formData.get("isPrivate") === "on"
  const maxPlayers = Number.parseInt(formData.get("maxPlayers") as string)
  const lobbyType = formData.get("lobbyType")

  if (!name || !lobbyType) {
    return { error: "Name and lobby type are required" }
  }

  if (maxPlayers < 2 || maxPlayers > 8) {
    return { error: "Max players must be between 2 and 8" }
  }

  // Get player name
  const { data: playerData } = await supabase.from("player_stats").select("player_name").eq("id", user.id).single()

  const lobbyId = `lobby_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    // Create lobby
    const { error: lobbyError } = await supabase.from("lobbies").insert({
      id: lobbyId,
      name: name.toString(),
      host_name: playerData?.player_name || "Unknown",
      is_private: isPrivate,
      max_players: maxPlayers,
      lobby_type: lobbyType.toString(),
      status: "waiting",
      current_players: [playerData?.player_name || "Unknown"],
    })

    if (lobbyError) {
      console.error("Lobby creation error:", lobbyError)
      return { error: "Failed to create lobby" }
    }

    // Add host as first player
    const { error: playerError } = await supabase.from("lobby_players").insert({
      lobby_id: lobbyId,
      player_name: playerData?.player_name || "Unknown",
      is_ready: false,
    })

    if (playerError) {
      console.error("Player join error:", playerError)
    }

    redirect(`/lobby/${lobbyId}`)
  } catch (error) {
    console.error("Create lobby error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function joinLobby(lobbyId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to join a lobby" }
  }

  // Get player name
  const { data: playerData } = await supabase.from("player_stats").select("player_name").eq("id", user.id).single()

  // Get current lobby state
  const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", lobbyId).single()

  if (!lobby) {
    return { error: "Lobby not found" }
  }

  if (lobby.current_players?.length >= lobby.max_players) {
    return { error: "Lobby is full" }
  }

  if (lobby.current_players?.includes(playerData?.player_name)) {
    return { error: "You are already in this lobby" }
  }

  try {
    // Add player to lobby
    const { error: playerError } = await supabase.from("lobby_players").insert({
      lobby_id: lobbyId,
      player_name: playerData?.player_name || "Unknown",
      is_ready: false,
    })

    if (playerError) {
      return { error: "Failed to join lobby" }
    }

    // Update lobby current_players array
    const updatedPlayers = [...(lobby.current_players || []), playerData?.player_name || "Unknown"]
    const { error: lobbyError } = await supabase
      .from("lobbies")
      .update({ current_players: updatedPlayers })
      .eq("id", lobbyId)

    if (lobbyError) {
      console.error("Lobby update error:", lobbyError)
    }

    revalidatePath(`/lobby/${lobbyId}`)
    return { success: true }
  } catch (error) {
    console.error("Join lobby error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function leaveLobby(lobbyId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  // Get player name
  const { data: playerData } = await supabase.from("player_stats").select("player_name").eq("id", user.id).single()

  try {
    // Remove player from lobby_players
    const { error: playerError } = await supabase
      .from("lobby_players")
      .delete()
      .eq("lobby_id", lobbyId)
      .eq("player_name", playerData?.player_name)

    if (playerError) {
      return { error: "Failed to leave lobby" }
    }

    // Update lobby current_players array
    const { data: lobby } = await supabase
      .from("lobbies")
      .select("current_players, host_name")
      .eq("id", lobbyId)
      .single()

    if (lobby) {
      const updatedPlayers = (lobby.current_players || []).filter((name: string) => name !== playerData?.player_name)

      if (updatedPlayers.length === 0) {
        // Delete empty lobby
        await supabase.from("lobbies").delete().eq("id", lobbyId)
      } else {
        await supabase.from("lobbies").update({ current_players: updatedPlayers }).eq("id", lobbyId)
      }
    }

    redirect("/dashboard")
  } catch (error) {
    console.error("Leave lobby error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function toggleReady(lobbyId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  // Get player name
  const { data: playerData } = await supabase.from("player_stats").select("player_name").eq("id", user.id).single()

  // Get current ready state
  const { data: lobbyPlayer } = await supabase
    .from("lobby_players")
    .select("is_ready")
    .eq("lobby_id", lobbyId)
    .eq("player_name", playerData?.player_name)
    .single()

  if (!lobbyPlayer) {
    return { error: "Player not found in lobby" }
  }

  try {
    const { error } = await supabase
      .from("lobby_players")
      .update({ is_ready: !lobbyPlayer.is_ready })
      .eq("lobby_id", lobbyId)
      .eq("player_name", playerData?.player_name)

    if (error) {
      return { error: "Failed to update ready state" }
    }

    revalidatePath(`/lobby/${lobbyId}`)
    return { success: true }
  } catch (error) {
    console.error("Toggle ready error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function initializeDraft(lobbyId: string) {
  const supabase = createClient()

  try {
    // Get all players in the lobby with their ELO ratings
    const { data: lobbyPlayers } = await supabase
      .from("lobby_players")
      .select(`
        player_name,
        player_stats!inner(elo_rating)
      `)
      .eq("lobby_id", lobbyId)

    if (!lobbyPlayers || lobbyPlayers.length < 4) {
      return { error: "Need at least 4 players to start draft" }
    }

    // Sort players by ELO (highest first) and select top 2 as captains
    const sortedPlayers = lobbyPlayers.sort(
      (a, b) => (b.player_stats?.elo_rating || 1000) - (a.player_stats?.elo_rating || 1000),
    )

    const captain1 = sortedPlayers[0].player_name
    const captain2 = sortedPlayers[1].player_name
    const availablePlayers = sortedPlayers.slice(2).map((p) => p.player_name)

    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create draft state
    const { error: draftError } = await supabase.from("draft_state").insert({
      id: draftId,
      lobby_id: lobbyId,
      captain1_name: captain1,
      captain2_name: captain2,
      team1_players: [captain1],
      team2_players: [captain2],
      available_players: availablePlayers,
      current_turn: captain1,
      status: "active",
    })

    if (draftError) {
      console.error("Draft creation error:", draftError)
      return { error: "Failed to initialize draft" }
    }

    // Update lobby status
    await supabase.from("lobbies").update({ status: "drafting" }).eq("id", lobbyId)

    return { success: true, draftId }
  } catch (error) {
    console.error("Initialize draft error:", error)
    return { error: "An unexpected error occurred" }
  }
}
