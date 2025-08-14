"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Authentication actions
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

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

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/profile/setup`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

// Player profile actions
export async function createPlayerProfile(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const username = formData.get("username")
  const displayName = formData.get("displayName")
  const position = formData.get("position")
  const bio = formData.get("bio")

  if (!username || !displayName || !position) {
    return { error: "Username, display name, and position are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create a profile" }
    }

    const { error } = await supabase.from("players").insert({
      user_id: user.id,
      username: username.toString(),
      display_name: displayName.toString(),
      email: user.email!,
      position: position.toString(),
      bio: bio?.toString() || null,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Profile creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updatePlayerProfile(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const displayName = formData.get("displayName")
  const position = formData.get("position")
  const bio = formData.get("bio")

  if (!displayName || !position) {
    return { error: "Display name and position are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to update your profile" }
    }

    const { error } = await supabase
      .from("players")
      .update({
        display_name: displayName.toString(),
        position: position.toString(),
        bio: bio?.toString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Draft system actions
export async function createDraft(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const description = formData.get("description")
  const maxTeams = formData.get("maxTeams")
  const draftDate = formData.get("draftDate")

  if (!name || !maxTeams || !draftDate) {
    return { error: "Name, max teams, and draft date are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create a draft" }
    }

    // Get the player profile
    const { data: player } = await supabase.from("players").select("id").eq("user_id", user.id).single()

    if (!player) {
      return { error: "You must have a player profile to create a draft" }
    }

    const { data: tournament, error } = await supabase
      .from("tournaments")
      .insert({
        name: name.toString(),
        description: description?.toString() || null,
        tournament_type: "bracket",
        max_teams: Number.parseInt(maxTeams.toString()),
        start_date: new Date(draftDate.toString()).toISOString(),
        status: "upcoming",
        created_by: player.id,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { success: true, tournamentId: tournament.id }
  } catch (error) {
    console.error("Draft creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function joinDraft(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const tournamentId = formData.get("tournamentId")

  if (!tournamentId) {
    return { error: "Tournament ID is required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to join a draft" }
    }

    // Get the player profile
    const { data: player } = await supabase.from("players").select("*").eq("user_id", user.id).single()

    if (!player) {
      return { error: "You must have a player profile to join a draft" }
    }

    // Check if tournament exists and is open for registration
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId.toString())
      .single()

    if (!tournament) {
      return { error: "Tournament not found" }
    }

    if (tournament.status !== "upcoming") {
      return { error: "This tournament is no longer accepting registrations" }
    }

    // Check if player is already registered
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("id")
      .eq("tournament_id", tournamentId.toString())
      .eq("captain_id", player.id)
      .single()

    if (existingTeam) {
      return { error: "You are already registered for this tournament" }
    }

    // Create a team for this player
    const { error } = await supabase.from("teams").insert({
      name: `${player.display_name}'s Team`,
      captain_id: player.id,
      tournament_id: tournamentId.toString(),
      team_type: "draft",
      color: "#FF6B35",
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Draft join error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function startDraft(tournamentId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Update tournament status to active
    const { error } = await supabase
      .from("tournaments")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", tournamentId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Start draft error:", error)
    return { error: "Failed to start draft" }
  }
}

export async function makeDraftPick(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const tournamentId = formData.get("tournamentId")
  const playerId = formData.get("playerId")
  const teamId = formData.get("teamId")
  const pickNumber = formData.get("pickNumber")
  const roundNumber = formData.get("roundNumber")

  if (!tournamentId || !playerId || !teamId || !pickNumber || !roundNumber) {
    return { error: "All draft pick fields are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to make a draft pick" }
    }

    // Verify this is the captain's turn
    const { data: team } = await supabase
      .from("teams")
      .select("captain_id, players!inner(user_id)")
      .eq("id", teamId.toString())
      .single()

    if (!team || team.players.user_id !== user.id) {
      return { error: "You are not authorized to make this pick" }
    }

    // Record the draft pick
    const { error: draftError } = await supabase.from("draft_events").insert({
      tournament_id: tournamentId.toString(),
      team_id: teamId.toString(),
      player_id: playerId.toString(),
      pick_number: Number.parseInt(pickNumber.toString()),
      round_number: Number.parseInt(roundNumber.toString()),
      draft_type: "snake",
    })

    if (draftError) {
      return { error: draftError.message }
    }

    // Add player to team
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: teamId.toString(),
      player_id: playerId.toString(),
      position: null,
      is_captain: false,
    })

    if (memberError) {
      return { error: memberError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Draft pick error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Tournament scheduling actions
export async function generateTournamentBracket(tournamentId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to generate brackets" }
    }

    // Get tournament and teams
    const { data: tournament } = await supabase
      .from("tournaments")
      .select(`
        *,
        teams (
          id,
          name,
          captain_id,
          players:players!teams_captain_id_fkey (
            display_name,
            elo_rating
          )
        )
      `)
      .eq("id", tournamentId)
      .single()

    if (!tournament) {
      return { error: "Tournament not found" }
    }

    const teams = tournament.teams || []
    if (teams.length < 4) {
      return { error: "Need at least 4 teams to generate bracket" }
    }

    // Generate bracket games
    const games = []
    const numTeams = teams.length
    const rounds = Math.ceil(Math.log2(numTeams))

    // First round - pair teams
    for (let i = 0; i < numTeams; i += 2) {
      if (i + 1 < numTeams) {
        games.push({
          tournament_id: tournamentId,
          team1_id: teams[i].id,
          team2_id: teams[i + 1].id,
          status: "scheduled",
          game_type: "4v4",
          duration_minutes: 20,
        })
      }
    }

    // Insert games
    const { error } = await supabase.from("games").insert(games)

    if (error) {
      return { error: error.message }
    }

    // Update tournament status
    await supabase
      .from("tournaments")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", tournamentId)

    return { success: true }
  } catch (error) {
    console.error("Bracket generation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function scheduleGame(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const gameId = formData.get("gameId")
  const scheduledAt = formData.get("scheduledAt")

  if (!gameId || !scheduledAt) {
    return { error: "Game ID and scheduled time are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase
      .from("games")
      .update({
        scheduled_at: new Date(scheduledAt.toString()).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId.toString())

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Game scheduling error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function recordGameResult(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const gameId = formData.get("gameId")
  const team1Score = formData.get("team1Score")
  const team2Score = formData.get("team2Score")

  if (!gameId || team1Score === null || team2Score === null) {
    return { error: "Game ID and scores are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const score1 = Number.parseInt(team1Score.toString())
    const score2 = Number.parseInt(team2Score.toString())

    if (score1 === score2) {
      return { error: "Games cannot end in a tie" }
    }

    // Update game result
    const { data: game, error: gameError } = await supabase
      .from("games")
      .update({
        team1_score: score1,
        team2_score: score2,
        status: "completed",
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId.toString())
      .select(`
        *,
        team1:teams!games_team1_id_fkey (
          id,
          name,
          captain_id,
          players:players!teams_captain_id_fkey (id, elo_rating)
        ),
        team2:teams!games_team2_id_fkey (
          id,
          name,
          captain_id,
          players:players!teams_captain_id_fkey (id, elo_rating)
        )
      `)
      .single()

    if (gameError) {
      return { error: gameError.message }
    }

    // Update player ELO ratings
    const winner = score1 > score2 ? game.team1 : game.team2
    const loser = score1 > score2 ? game.team2 : game.team1

    // Simple ELO calculation (K-factor of 32)
    const winnerElo = winner.players?.elo_rating || 1200
    const loserElo = loser.players?.elo_rating || 1200
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400))

    const newWinnerElo = Math.round(winnerElo + 32 * (1 - expectedWinner))
    const newLoserElo = Math.round(loserElo + 32 * (0 - expectedLoser))

    // Update ELO ratings
    await supabase
      .from("players")
      .update({
        elo_rating: newWinnerElo,
        wins: winner.players?.wins + 1 || 1,
        games_played: winner.players?.games_played + 1 || 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", winner.captain_id)

    await supabase
      .from("players")
      .update({
        elo_rating: newLoserElo,
        losses: loser.players?.losses + 1 || 1,
        games_played: loser.players?.games_played + 1 || 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", loser.captain_id)

    // Check if we need to advance to next round
    const tournamentId = formData.get("tournamentId") // Declare tournamentId here
    await advanceToNextRound(tournamentId.toString(), gameId.toString())

    return { success: true }
  } catch (error) {
    console.error("Game result recording error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

async function advanceToNextRound(tournamentId: string, completedGameId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get all games in current round
    const { data: games } = await supabase
      .from("games")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true })

    if (!games) return

    // Find current round games
    const completedGames = games.filter((g) => g.status === "completed")
    const scheduledGames = games.filter((g) => g.status === "scheduled")

    // If all games in current round are completed, create next round
    if (scheduledGames.length === 0 && completedGames.length > 1) {
      const winners = completedGames.map((game) => {
        return game.team1_score > game.team2_score ? game.team1_id : game.team2_id
      })

      // Create next round games
      const nextRoundGames = []
      for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
          nextRoundGames.push({
            tournament_id: tournamentId,
            team1_id: winners[i],
            team2_id: winners[i + 1],
            status: "scheduled",
            game_type: "4v4",
            duration_minutes: 20,
          })
        }
      }

      if (nextRoundGames.length > 0) {
        await supabase.from("games").insert(nextRoundGames)
      } else if (winners.length === 1) {
        // Tournament complete
        await supabase
          .from("tournaments")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("id", tournamentId)
      }
    }
  } catch (error) {
    console.error("Advance round error:", error)
  }
}

// Auction league actions
export async function createAuctionLeague(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const description = formData.get("description")
  const maxTeams = formData.get("maxTeams")
  const budgetCap = formData.get("budgetCap")
  const draftDate = formData.get("draftDate")
  const seasonStart = formData.get("seasonStart")
  const seasonEnd = formData.get("seasonEnd")

  if (!name || !maxTeams || !budgetCap || !draftDate) {
    return { error: "Name, max teams, budget cap, and draft date are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create an auction league" }
    }

    // Get the player profile
    const { data: player } = await supabase.from("players").select("id").eq("user_id", user.id).single()

    if (!player) {
      return { error: "You must have a player profile to create an auction league" }
    }

    const { data: league, error } = await supabase
      .from("auction_leagues")
      .insert({
        name: name.toString(),
        description: description?.toString() || null,
        max_teams: Number.parseInt(maxTeams.toString()),
        budget_cap: Number.parseInt(budgetCap.toString()),
        draft_date: new Date(draftDate.toString()).toISOString(),
        season_start: seasonStart ? new Date(seasonStart.toString()).toISOString() : null,
        season_end: seasonEnd ? new Date(seasonEnd.toString()).toISOString() : null,
        status: "setup",
        created_by: player.id,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Add all active players to the player pool
    const { data: players } = await supabase.from("players").select("id, elo_rating").eq("is_active", true)

    if (players && players.length > 0) {
      const playerPoolEntries = players.map((player) => ({
        league_id: league.id,
        player_id: player.id,
        base_price: Math.max(50, Math.floor(player.elo_rating / 10)), // Base price based on ELO
        current_bid: 0,
        is_available: true,
      }))

      await supabase.from("player_pool").insert(playerPoolEntries)
    }

    return { success: true, leagueId: league.id }
  } catch (error) {
    console.error("Auction league creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function joinAuctionLeague(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const leagueId = formData.get("leagueId")
  const teamName = formData.get("teamName")

  if (!leagueId || !teamName) {
    return { error: "League ID and team name are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to join an auction league" }
    }

    // Get the player profile
    const { data: player } = await supabase.from("players").select("*").eq("user_id", user.id).single()

    if (!player) {
      return { error: "You must have a player profile to join an auction league" }
    }

    // Check if league exists and is open for registration
    const { data: league } = await supabase.from("auction_leagues").select("*").eq("id", leagueId.toString()).single()

    if (!league) {
      return { error: "League not found" }
    }

    if (league.status !== "setup") {
      return { error: "This league is no longer accepting registrations" }
    }

    // Check if player is already registered
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("id")
      .eq("league_id", leagueId.toString())
      .eq("captain_id", player.id)
      .single()

    if (existingTeam) {
      return { error: "You are already registered for this league" }
    }

    // Create a team for this player
    const { error } = await supabase.from("teams").insert({
      name: teamName.toString(),
      captain_id: player.id,
      league_id: leagueId.toString(),
      team_type: "auction",
      color: "#10B981",
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Auction league join error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function placeBid(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const playerPoolId = formData.get("playerPoolId")
  const bidAmount = formData.get("bidAmount")
  const teamId = formData.get("teamId")

  if (!playerPoolId || !bidAmount || !teamId) {
    return { error: "Player pool ID, bid amount, and team ID are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to place a bid" }
    }

    const bid = Number.parseInt(bidAmount.toString())

    // Get current player pool entry
    const { data: poolEntry } = await supabase
      .from("player_pool")
      .select("*, auction_leagues(budget_cap)")
      .eq("id", playerPoolId.toString())
      .single()

    if (!poolEntry) {
      return { error: "Player not found in pool" }
    }

    if (!poolEntry.is_available) {
      return { error: "This player is no longer available" }
    }

    if (bid <= poolEntry.current_bid) {
      return { error: `Bid must be higher than current bid of $${poolEntry.current_bid}` }
    }

    if (bid < poolEntry.base_price) {
      return { error: `Bid must be at least the base price of $${poolEntry.base_price}` }
    }

    // Check team's remaining budget
    const { data: teamSpending } = await supabase
      .from("player_pool")
      .select("current_bid")
      .eq("league_id", poolEntry.league_id)
      .eq("winning_team_id", teamId.toString())

    const totalSpent = teamSpending?.reduce((sum, entry) => sum + entry.current_bid, 0) || 0
    const remainingBudget = poolEntry.auction_leagues.budget_cap - totalSpent

    if (bid > remainingBudget) {
      return { error: `Insufficient budget. You have $${remainingBudget} remaining` }
    }

    // Update the bid
    const { error } = await supabase
      .from("player_pool")
      .update({
        current_bid: bid,
        winning_team_id: teamId.toString(),
      })
      .eq("id", playerPoolId.toString())

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Bid placement error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function startAuction(leagueId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Update league status to drafting
    const { error } = await supabase
      .from("auction_leagues")
      .update({ status: "drafting", updated_at: new Date().toISOString() })
      .eq("id", leagueId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Start auction error:", error)
    return { error: "Failed to start auction" }
  }
}

export async function finalizeAuction(leagueId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Mark all players as unavailable and finalize winning bids
    await supabase
      .from("player_pool")
      .update({ is_available: false })
      .eq("league_id", leagueId)
      .not("winning_team_id", "is", null)

    // Add winning players to their teams
    const { data: winningBids } = await supabase
      .from("player_pool")
      .select("player_id, winning_team_id")
      .eq("league_id", leagueId)
      .not("winning_team_id", "is", null)

    if (winningBids && winningBids.length > 0) {
      const teamMembers = winningBids.map((bid) => ({
        team_id: bid.winning_team_id,
        player_id: bid.player_id,
        is_captain: false,
      }))

      await supabase.from("team_members").insert(teamMembers)
    }

    // Update league status to active
    const { error } = await supabase
      .from("auction_leagues")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", leagueId)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Finalize auction error:", error)
    return { error: "Failed to finalize auction" }
  }
}

// Game scoring actions
export async function addScorer(gameId: string, userId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.from("live_subscriptions").insert({
      game_id: gameId,
      user_id: userId,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Add scorer error:", error)
    return { error: "Failed to add scorer" }
  }
}

export async function startGame(gameId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase
      .from("games")
      .update({
        status: "live",
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Start game error:", error)
    return { error: "Failed to start game" }
  }
}

export async function endGame(gameId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase
      .from("games")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("End game error:", error)
    return { error: "Failed to end game" }
  }
}

export async function updateGameScore(gameId: string, team1Score: number, team2Score: number) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase
      .from("games")
      .update({
        team1_score: team1Score,
        team2_score: team2Score,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Update game score error:", error)
    return { error: "Failed to update game score" }
  }
}

export async function addScoringEvent(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const gameId = formData.get("gameId")
  const playerId = formData.get("playerId")
  const teamId = formData.get("teamId")
  const eventType = formData.get("eventType")
  const eventTime = formData.get("eventTime")
  const description = formData.get("description")

  if (!gameId || !playerId || !teamId || !eventType || !eventTime) {
    return { error: "All scoring event fields are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to add scoring events" }
    }

    // Get the player profile
    const { data: player } = await supabase.from("players").select("id").eq("user_id", user.id).single()

    if (!player) {
      return { error: "You must have a player profile to add scoring events" }
    }

    const { error } = await supabase.from("game_events").insert({
      game_id: gameId.toString(),
      player_id: playerId.toString(),
      team_id: teamId.toString(),
      event_type: eventType.toString(),
      event_time: Number.parseInt(eventTime.toString()),
      description: description?.toString() || null,
      recorded_by: player.id,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Add scoring event error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
