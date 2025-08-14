import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import DraftInterface from "@/components/draft-interface"

interface GamePageProps {
  params: {
    id: string
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get player profile
  const { data: player } = await supabase.from("players").select("*").eq("id", user.id).single()

  if (!player) {
    redirect("/auth/login")
  }

  // Get lobby details
  const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", params.id).single()

  if (!lobby) {
    notFound()
  }

  // Get lobby players with their ELO ratings
  const { data: lobbyPlayers } = await supabase
    .from("lobby_players")
    .select(`
      *,
      players!inner(name, elo_rating, profile_picture, banner_image)
    `)
    .eq("lobby_id", params.id)
    .order("joined_at", { ascending: true })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DraftInterface
        lobbyId={params.id}
        currentPlayer={player}
        lobbyPlayers={lobbyPlayers || []}
        lobbyType={lobby.lobby_type}
      />
    </div>
  )
}
