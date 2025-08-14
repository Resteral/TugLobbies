"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createTournament(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a tournament" }
  }

  const name = formData.get("name")
  const type = formData.get("type")
  const maxTeams = Number.parseInt(formData.get("maxTeams") as string)
  const entryFee = Number.parseInt(formData.get("entryFee") as string)
  const prizePool = Number.parseInt(formData.get("prizePool") as string)
  const registrationType = formData.get("registrationType")

  if (!name || !type || !registrationType) {
    return { error: "Name, type, and registration type are required" }
  }

  if (maxTeams < 4 || maxTeams > 64) {
    return { error: "Max teams must be between 4 and 64" }
  }

  try {
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .insert({
        name: name.toString(),
        type: type.toString(),
        max_teams: maxTeams,
        entry_fee: entryFee || 0,
        prize_pool: prizePool || 0,
        registration_type: registrationType.toString(),
        status: "registration",
        created_by: user.id,
      })
      .select()
      .single()

    if (tournamentError) {
      console.error("Tournament creation error:", tournamentError)
      return { error: "Failed to create tournament" }
    }

    redirect(`/tournament/${tournament.id}`)
  } catch (error) {
    console.error("Create tournament error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function registerForTournament(tournamentId: string, participantType: "player" | "team") {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to register" }
  }

  try {
    // Check if tournament exists and is accepting registrations
    const { data: tournament } = await supabase.from("tournaments").select("*").eq("id", tournamentId).single()

    if (!tournament) {
      return { error: "Tournament not found" }
    }

    if (tournament.status !== "registration") {
      return { error: "Tournament registration is closed" }
    }

    // Check current participant count
    const { data: participants } = await supabase
      .from("tournament_participants")
      .select("*")
      .eq("tournament_id", tournamentId)

    if (participants && participants.length >= tournament.max_teams) {
      return { error: "Tournament is full" }
    }

    // Check if already registered
    const existingParticipant = participants?.find((p) => p.participant_id === user.id)
    if (existingParticipant) {
      return { error: "Already registered for this tournament" }
    }

    // Register participant
    const { error: registrationError } = await supabase.from("tournament_participants").insert({
      tournament_id: tournamentId,
      participant_id: user.id,
      participant_type: participantType,
      seed_number: (participants?.length || 0) + 1,
      eliminated: false,
      prize_amount: 0,
    })

    if (registrationError) {
      return { error: "Failed to register for tournament" }
    }

    revalidatePath(`/tournament/${tournamentId}`)
    return { success: true }
  } catch (error) {
    console.error("Tournament registration error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function startTournament(tournamentId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Check if user is tournament creator
    const { data: tournament } = await supabase.from("tournaments").select("*").eq("id", tournamentId).single()

    if (!tournament) {
      return { error: "Tournament not found" }
    }

    if (tournament.created_by !== user.id) {
      return { error: "Only tournament creator can start the tournament" }
    }

    if (tournament.status !== "registration") {
      return { error: "Tournament cannot be started" }
    }

    // Get participants
    const { data: participants } = await supabase
      .from("tournament_participants")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("seed_number", { ascending: true })

    if (!participants || participants.length < 4) {
      return { error: "Need at least 4 participants to start tournament" }
    }

    // Generate first round matches
    const matches = []
    const numParticipants = participants.length
    const numMatches = Math.floor(numParticipants / 2)

    for (let i = 0; i < numMatches; i++) {
      const team1 = participants[i * 2]
      const team2 = participants[i * 2 + 1]

      matches.push({
        tournament_id: tournamentId,
        round_number: 1,
        match_number: i + 1,
        team1_id: team1.participant_id,
        team2_id: team2.participant_id,
        bracket_type: "main",
        status: "scheduled",
        team1_score: 0,
        team2_score: 0,
        scheduled_at: new Date(Date.now() + (i + 1) * 60 * 60 * 1000), // Schedule matches 1 hour apart
      })
    }

    // Insert matches
    const { error: matchesError } = await supabase.from("tournament_matches").insert(matches)

    if (matchesError) {
      return { error: "Failed to create tournament matches" }
    }

    // Update tournament status
    const { error: updateError } = await supabase
      .from("tournaments")
      .update({ status: "active" })
      .eq("id", tournamentId)

    if (updateError) {
      return { error: "Failed to start tournament" }
    }

    revalidatePath(`/tournament/${tournamentId}`)
    return { success: true }
  } catch (error) {
    console.error("Start tournament error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function submitMatchResult(matchId: string, team1Score: number, team2Score: number) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get match details
    const { data: match } = await supabase.from("tournament_matches").select("*").eq("id", matchId).single()

    if (!match) {
      return { error: "Match not found" }
    }

    // Determine winner
    const winnerId = team1Score > team2Score ? match.team1_id : match.team2_id
    const loserId = team1Score > team2Score ? match.team2_id : match.team1_id

    // Update match result
    const { error: matchError } = await supabase
      .from("tournament_matches")
      .update({
        team1_score: team1Score,
        team2_score: team2Score,
        winner_id: winnerId,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", matchId)

    if (matchError) {
      return { error: "Failed to update match result" }
    }

    // Mark loser as eliminated
    const { error: eliminationError } = await supabase
      .from("tournament_participants")
      .update({ eliminated: true })
      .eq("tournament_id", match.tournament_id)
      .eq("participant_id", loserId)

    if (eliminationError) {
      console.error("Elimination error:", eliminationError)
    }

    // Check if we need to create next round match
    const { data: roundMatches } = await supabase
      .from("tournament_matches")
      .select("*")
      .eq("tournament_id", match.tournament_id)
      .eq("round_number", match.round_number)

    const completedMatches = roundMatches?.filter((m) => m.status === "completed") || []

    // If all matches in round are complete, create next round
    if (completedMatches.length === roundMatches?.length && completedMatches.length > 1) {
      const winners = completedMatches.map((m) => m.winner_id)
      const nextRoundMatches = []

      for (let i = 0; i < winners.length; i += 2) {
        if (winners[i + 1]) {
          nextRoundMatches.push({
            tournament_id: match.tournament_id,
            round_number: match.round_number + 1,
            match_number: Math.floor(i / 2) + 1,
            team1_id: winners[i],
            team2_id: winners[i + 1],
            bracket_type: "main",
            status: "scheduled",
            team1_score: 0,
            team2_score: 0,
            scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
          })
        }
      }

      if (nextRoundMatches.length > 0) {
        await supabase.from("tournament_matches").insert(nextRoundMatches)
      } else if (winners.length === 1) {
        // Tournament complete
        await supabase.from("tournaments").update({ status: "completed" }).eq("id", match.tournament_id)
      }
    }

    revalidatePath(`/tournament/${match.tournament_id}`)
    return { success: true }
  } catch (error) {
    console.error("Submit match result error:", error)
    return { error: "An unexpected error occurred" }
  }
}
