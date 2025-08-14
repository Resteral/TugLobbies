import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LobbyRoom from "@/components/lobby-room"

interface LobbyPageProps {
  params: {
    id: string
  }
}

export default async function LobbyPage({ params }: LobbyPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get lobby data
  const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", params.id).single()

  if (!lobby) {
    redirect("/lobbies")
  }

  // Get lobby players
  const { data: players } = await supabase
    .from("lobby_players")
    .select("*")
    .eq("lobby_id", params.id)
    .order("joined_at", { ascending: true })

  // Get current user's player data
  const { data: currentPlayer } = await supabase.from("player_stats").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <LobbyRoom lobby={lobby} players={players || []} currentPlayer={currentPlayer} userId={user.id} />
    </div>
  )
}
