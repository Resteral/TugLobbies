import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DraftInterface from "@/components/draft-interface"

interface DraftPageProps {
  params: {
    id: string
  }
}

export default async function DraftPage({ params }: DraftPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get draft state
  const { data: draftState } = await supabase.from("draft_state").select("*").eq("lobby_id", params.id).single()

  if (!draftState) {
    redirect(`/lobby/${params.id}`)
  }

  // Get lobby info
  const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", params.id).single()

  // Get current user's player data
  const { data: currentPlayer } = await supabase.from("player_stats").select("*").eq("id", user.id).single()

  // Get all player stats for ELO display
  const allPlayerNames = [...draftState.team1, ...draftState.team2, ...draftState.available_players]
  const { data: allPlayerStats } = await supabase
    .from("player_stats")
    .select("player_name, elo")
    .in("player_name", allPlayerNames)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <DraftInterface
        draftState={draftState}
        lobby={lobby}
        currentPlayer={currentPlayer}
        playerStats={allPlayerStats || []}
      />
    </div>
  )
}
