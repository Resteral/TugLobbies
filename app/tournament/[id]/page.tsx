import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TournamentView from "@/components/tournament-view"

interface TournamentPageProps {
  params: {
    id: string
  }
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get tournament data
  const { data: tournament } = await supabase.from("tournaments").select("*").eq("id", params.id).single()

  if (!tournament) {
    redirect("/tournaments")
  }

  // Get participants with player names
  const { data: participants } = await supabase
    .from("tournament_participants")
    .select(`
      *,
      player_stats!inner(player_name, elo)
    `)
    .eq("tournament_id", params.id)
    .order("seed_number", { ascending: true })

  // Get matches
  const { data: matches } = await supabase
    .from("tournament_matches")
    .select(`
      *,
      team1_player:player_stats!tournament_matches_team1_id_fkey(player_name),
      team2_player:player_stats!tournament_matches_team2_id_fkey(player_name)
    `)
    .eq("tournament_id", params.id)
    .order("round_number", { ascending: true })
    .order("match_number", { ascending: true })

  // Check if current user is registered
  const isRegistered = participants?.some((p) => p.participant_id === user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <TournamentView
        tournament={tournament}
        participants={participants || []}
        matches={matches || []}
        currentUserId={user.id}
        isRegistered={isRegistered || false}
      />
    </div>
  )
}
