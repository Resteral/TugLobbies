"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const playerName = formData.get("playerName")
  const accountId = formData.get("accountId")

  if (!email || !password || !playerName || !accountId) {
    return { error: "All fields are required" }
  }

  // Validate account ID is 6-14 digits
  const accountIdStr = accountId.toString()
  if (!/^\d{6,14}$/.test(accountIdStr)) {
    return { error: "Account ID must be 6-14 digits" }
  }

  const supabase = createClient()

  try {
    // Check if account ID or player name already exists
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .or(`name.eq.${playerName},starcraft_account_id.eq.${accountIdStr}`)
      .single()

    if (existingPlayer) {
      return { error: "Player name or account ID already exists" }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    // Create player profile
    if (authData.user) {
      const { error: playerError } = await supabase.from("players").insert({
        id: authData.user.id,
        name: playerName.toString(),
        starcraft_account_id: accountIdStr,
        elo_rating: 1200, // Starting ELO
        wins: 0,
        losses: 0,
        games_played: 0,
        verified: false,
      })

      if (playerError) {
        console.error("Player creation error:", playerError)
        return { error: "Failed to create player profile" }
      }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function updatePlayerProfile(prevState: any, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const playerName = formData.get("playerName")
  const accountId = formData.get("accountId")

  if (!playerName || !accountId) {
    return { error: "Player name and account ID are required" }
  }

  const accountIdStr = accountId.toString()
  if (!/^\d{6,14}$/.test(accountIdStr)) {
    return { error: "Account ID must be 6-14 digits" }
  }

  try {
    const { error } = await supabase
      .from("players")
      .update({
        name: playerName.toString(),
        starcraft_account_id: accountIdStr,
      })
      .eq("id", user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/profile")
    return { success: "Profile updated successfully" }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "Failed to update profile" }
  }
}

export async function createLobby(prevState: any, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const lobbyName = formData.get("lobbyName")
  const maxPlayers = formData.get("maxPlayers")
  const hostName = formData.get("hostName")
  const isPrivate = formData.get("isPrivate") === "true"
  const lobbyType = formData.get("lobbyType")

  if (!lobbyName || !maxPlayers || !hostName || !lobbyType) {
    return { error: "All fields are required" }
  }

  try {
    // Generate a unique lobby ID
    const lobbyId = `lobby_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { error } = await supabase.from("lobbies").insert({
      id: lobbyId,
      name: lobbyName.toString(),
      max_players: Number.parseInt(maxPlayers.toString()),
      host_name: hostName.toString(),
      is_private: isPrivate,
      lobby_type: lobbyType.toString(),
      status: "waiting",
      current_players: [hostName.toString()],
    })

    if (error) {
      console.error("Lobby creation error:", error)
      return { error: "Failed to create lobby" }
    }

    // Add host as first player
    await supabase.from("lobby_players").insert({
      lobby_id: lobbyId,
      player_name: hostName.toString(),
      is_ready: false,
    })

    revalidatePath("/lobbies")
    return { success: true, lobbyId }
  } catch (error) {
    console.error("Lobby creation error:", error)
    return { error: "Failed to create lobby" }
  }
}

export async function joinLobby(prevState: any, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const lobbyId = formData.get("lobbyId")
  const playerName = formData.get("playerName")

  if (!lobbyId || !playerName) {
    return { error: "Missing required fields" }
  }

  try {
    // Check if lobby exists and has space
    const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", lobbyId).single()

    if (!lobby) {
      return { error: "Lobby not found" }
    }

    if (lobby.status !== "waiting") {
      return { error: "Lobby is not accepting players" }
    }

    // Check current player count
    const { data: currentPlayers } = await supabase.from("lobby_players").select("id").eq("lobby_id", lobbyId)

    if (currentPlayers && currentPlayers.length >= lobby.max_players) {
      return { error: "Lobby is full" }
    }

    // Check if player is already in lobby
    const { data: existingPlayer } = await supabase
      .from("lobby_players")
      .select("id")
      .eq("lobby_id", lobbyId)
      .eq("player_name", playerName.toString())
      .single()

    if (existingPlayer) {
      return { error: "You are already in this lobby" }
    }

    // Add player to lobby
    const { error } = await supabase.from("lobby_players").insert({
      lobby_id: lobbyId.toString(),
      player_name: playerName.toString(),
      is_ready: false,
    })

    if (error) {
      console.error("Join lobby error:", error)
      return { error: "Failed to join lobby" }
    }

    // Update lobby current_players array
    const updatedPlayers = [...(lobby.current_players || []), playerName.toString()]
    await supabase.from("lobbies").update({ current_players: updatedPlayers }).eq("id", lobbyId)

    revalidatePath(`/lobbies/${lobbyId}`)
    return { success: true }
  } catch (error) {
    console.error("Join lobby error:", error)
    return { error: "Failed to join lobby" }
  }
}

export async function leaveLobby(prevState: any, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const lobbyId = formData.get("lobbyId")
  const playerName = formData.get("playerName")

  if (!lobbyId || !playerName) {
    return { error: "Missing required fields" }
  }

  try {
    // Remove player from lobby_players
    const { error } = await supabase
      .from("lobby_players")
      .delete()
      .eq("lobby_id", lobbyId)
      .eq("player_name", playerName.toString())

    if (error) {
      console.error("Leave lobby error:", error)
      return { error: "Failed to leave lobby" }
    }

    // Update lobby current_players array
    const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", lobbyId).single()

    if (lobby) {
      const updatedPlayers = (lobby.current_players || []).filter((name: string) => name !== playerName.toString())
      await supabase.from("lobbies").update({ current_players: updatedPlayers }).eq("id", lobbyId)
    }

    revalidatePath(`/lobbies/${lobbyId}`)
    return { success: true }
  } catch (error) {
    console.error("Leave lobby error:", error)
    return { error: "Failed to leave lobby" }
  }
}

export async function startGame(prevState: any, formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const lobbyId = formData.get("lobbyId")

  if (!lobbyId) {
    return { error: "Missing lobby ID" }
  }

  try {
    // Check if user is the host
    const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", lobbyId).single()

    if (!lobby) {
      return { error: "Lobby not found" }
    }

    const { data: player } = await supabase.from("players").select("name").eq("id", user.id).single()

    if (!player || lobby.host_name !== player.name) {
      return { error: "Only the host can start the game" }
    }

    // Check minimum players
    const { data: players } = await supabase.from("lobby_players").select("id").eq("lobby_id", lobbyId)

    if (!players || players.length < 2) {
      return { error: "Need at least 2 players to start" }
    }

    // Update lobby status
    const { error } = await supabase.from("lobbies").update({ status: "in_progress" }).eq("id", lobbyId)

    if (error) {
      console.error("Start game error:", error)
      return { error: "Failed to start game" }
    }

    revalidatePath(`/lobbies/${lobbyId}`)
    return { success: true }
  } catch (error) {
    console.error("Start game error:", error)
    return { error: "Failed to start game" }
  }
}

export async function exportGameStats(dateRange?: any): Promise<string> {
  const supabase = createClient()

  let query = supabase
    .from("game_sessions")
    .select(`
      id,
      created_at,
      game_type,
      winning_team,
      team1_score,
      team2_score,
      duration_minutes,
      game_stats(
        player_name,
        team,
        kills,
        deaths,
        assists,
        score,
        mvp_votes
      )
    `)
    .order("created_at", { ascending: false })

  if (dateRange?.from) {
    query = query.gte("created_at", dateRange.from.toISOString())
  }
  if (dateRange?.to) {
    query = query.lte("created_at", dateRange.to.toISOString())
  }

  const { data: games } = await query

  if (!games) return ""

  // Create CSV header
  let csv =
    "Game ID,Date,Game Type,Winning Team,Team 1 Score,Team 2 Score,Duration (min),Player Name,Team,Kills,Deaths,Assists,Score,MVP Votes\n"

  // Add game data
  for (const game of games) {
    const baseRow = [
      game.id,
      new Date(game.created_at).toISOString().split("T")[0],
      game.game_type,
      game.winning_team,
      game.team1_score || 0,
      game.team2_score || 0,
      game.duration_minutes || 0,
    ]

    if (game.game_stats && game.game_stats.length > 0) {
      for (const stat of game.game_stats) {
        const row = [
          ...baseRow,
          stat.player_name,
          stat.team,
          stat.kills || 0,
          stat.deaths || 0,
          stat.assists || 0,
          stat.score || 0,
          stat.mvp_votes || 0,
        ]
        csv += row.join(",") + "\n"
      }
    } else {
      csv += baseRow.join(",") + ",,,,,,,\n"
    }
  }

  return csv
}

export async function exportPlayerStats(): Promise<string> {
  const supabase = createClient()

  const { data: players } = await supabase.from("players").select("*").order("elo_rating", { ascending: false })

  if (!players) return ""

  // Create CSV header
  let csv = "Player Name,Account ID,ELO Rating,Games Played,Wins,Losses,Win Rate,Verified,Created At\n"

  // Add player data
  for (const player of players) {
    const winRate = player.games_played > 0 ? ((player.wins / player.games_played) * 100).toFixed(1) : "0.0"
    const row = [
      player.name,
      player.starcraft_account_id,
      player.elo_rating || 1200,
      player.games_played || 0,
      player.wins || 0,
      player.losses || 0,
      winRate + "%",
      player.verified ? "Yes" : "No",
      new Date(player.created_at).toISOString().split("T")[0],
    ]
    csv += row.join(",") + "\n"
  }

  return csv
}

export async function exportTournamentStats(dateRange?: any): Promise<string> {
  const supabase = createClient()

  let query = supabase
    .from("tournaments")
    .select(`
      *,
      tournament_participants(player_name),
      tournament_matches(
        match_number,
        player1_name,
        player2_name,
        winner_name,
        completed_at
      )
    `)
    .order("created_at", { ascending: false })

  if (dateRange?.from) {
    query = query.gte("created_at", dateRange.from.toISOString())
  }
  if (dateRange?.to) {
    query = query.lte("created_at", dateRange.to.toISOString())
  }

  const { data: tournaments } = await query

  if (!tournaments) return ""

  // Create CSV header
  let csv =
    "Tournament ID,Name,Type,Status,Entry Fee,Prize Pool,Participants,Start Date,End Date,Winner,Match Number,Player 1,Player 2,Match Winner,Match Date\n"

  // Add tournament data
  for (const tournament of tournaments) {
    const baseRow = [
      tournament.id,
      tournament.name,
      tournament.tournament_type,
      tournament.status,
      tournament.entry_fee || 0,
      tournament.prize_pool || 0,
      tournament.tournament_participants?.length || 0,
      new Date(tournament.start_date).toISOString().split("T")[0],
      tournament.end_date ? new Date(tournament.end_date).toISOString().split("T")[0] : "",
      tournament.winner_name || "",
    ]

    if (tournament.tournament_matches && tournament.tournament_matches.length > 0) {
      for (const match of tournament.tournament_matches) {
        const row = [
          ...baseRow,
          match.match_number,
          match.player1_name,
          match.player2_name,
          match.winner_name || "",
          match.completed_at ? new Date(match.completed_at).toISOString().split("T")[0] : "",
        ]
        csv += row.join(",") + "\n"
      }
    } else {
      csv += baseRow.join(",") + ",,,,\n"
    }
  }

  return csv
}

export async function makeDraftPick(lobbyId: string, playerName: string, currentPicker: string) {
  const supabase = createClient()

  try {
    // Get current draft state
    const { data: draftState } = await supabase.from("draft_state").select("*").eq("lobby_id", lobbyId).single()

    if (!draftState || draftState.current_picker !== currentPicker) {
      throw new Error("Not your turn to pick")
    }

    // Determine which team gets the player
    const isTeam1Turn = draftState.pick_number % 2 === 1
    const updatedTeam1 = isTeam1Turn ? [...draftState.team1_players, playerName] : draftState.team1_players
    const updatedTeam2 = !isTeam1Turn ? [...draftState.team2_players, playerName] : draftState.team2_players
    const updatedAvailable = draftState.available_players.filter((p: string) => p !== playerName)

    // Determine next picker (snake draft)
    let nextPicker = draftState.current_picker
    if (draftState.pick_number % 2 === 1) {
      nextPicker = draftState.captain2_id
    } else {
      nextPicker = draftState.captain1_id
    }

    // Check if draft is complete
    const draftComplete = updatedAvailable.length === 0

    // Update draft state
    await supabase
      .from("draft_state")
      .update({
        team1_players: updatedTeam1,
        team2_players: updatedTeam2,
        available_players: updatedAvailable,
        current_picker: draftComplete ? null : nextPicker,
        pick_number: draftState.pick_number + 1,
        draft_complete: draftComplete,
      })
      .eq("lobby_id", lobbyId)

    // Record the pick
    await supabase.from("draft_picks").insert({
      lobby_id: lobbyId,
      pick_number: draftState.pick_number,
      picker_name: currentPicker,
      picked_player: playerName,
      team: isTeam1Turn ? "team1" : "team2",
    })

    revalidatePath(`/game/${lobbyId}`)
  } catch (error) {
    console.error("Draft pick error:", error)
    throw error
  }
}

export async function passDraftTurn(lobbyId: string, currentPicker: string) {
  const supabase = createClient()

  try {
    // Get current draft state
    const { data: draftState } = await supabase.from("draft_state").select("*").eq("lobby_id", lobbyId).single()

    if (!draftState || draftState.current_picker !== currentPicker) {
      throw new Error("Not your turn to pass")
    }

    // Determine next picker
    let nextPicker = draftState.current_picker
    if (draftState.pick_number % 2 === 1) {
      nextPicker = draftState.captain2_id
    } else {
      nextPicker = draftState.captain1_id
    }

    // Update draft state
    await supabase
      .from("draft_state")
      .update({
        current_picker: nextPicker,
        pick_number: draftState.pick_number + 1,
      })
      .eq("lobby_id", lobbyId)

    // Record the pass
    await supabase.from("draft_actions").insert({
      lobby_id: lobbyId,
      action_type: "pass",
      player_name: currentPicker,
      pick_number: draftState.pick_number,
    })

    revalidatePath(`/game/${lobbyId}`)
  } catch (error) {
    console.error("Pass turn error:", error)
    throw error
  }
}

export async function startMatch(lobbyId: string) {
  const supabase = createClient()

  try {
    // Get draft state
    const { data: draftState } = await supabase.from("draft_state").select("*").eq("lobby_id", lobbyId).single()

    if (!draftState || !draftState.draft_complete) {
      throw new Error("Draft not complete")
    }

    // Create game session
    const gameSessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await supabase.from("game_sessions").insert({
      id: gameSessionId,
      lobby_id: lobbyId,
      game_type: "4v4_draft",
      team1_players: draftState.team1_players,
      team2_players: draftState.team2_players,
      status: "active",
    })

    // Update lobby status
    await supabase.from("lobbies").update({ status: "in_match" }).eq("id", lobbyId)

    revalidatePath(`/match/${gameSessionId}`)
    return { success: true, gameSessionId }
  } catch (error) {
    console.error("Start match error:", error)
    throw error
  }
}

export async function placeBet(lobbyId: string, playerName: string, teamBet: string, amount: number) {
  const supabase = createClient()

  try {
    await supabase.from("game_bets").insert({
      lobby_id: lobbyId,
      player_name: playerName,
      team_bet: teamBet,
      amount: amount,
      status: "active",
    })

    revalidatePath(`/lobbies/${lobbyId}`)
  } catch (error) {
    console.error("Place bet error:", error)
    throw error
  }
}

export async function updateProfile(playerId: string, profileData: any) {
  const supabase = createClient()

  try {
    await supabase
      .from("players")
      .update({
        name: profileData.name,
        bio: profileData.bio,
        profile_picture: profileData.profile_picture,
        banner_image: profileData.banner_image,
      })
      .eq("id", playerId)

    revalidatePath("/profile")
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}

export async function uploadProfileImage(file: File, playerId: string, type: "profile" | "banner"): Promise<string> {
  const supabase = createClient()

  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${playerId}_${type}_${Date.now()}.${fileExt}`
    const filePath = `profiles/${fileName}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error("Upload image error:", error)
    throw error
  }
}
