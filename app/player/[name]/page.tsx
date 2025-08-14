import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PlayerProfile from "@/components/player-profile"

interface PlayerPageProps {
  params: {
    name: string
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const playerName = decodeURIComponent(params.name)

  // Get player data
  const { data: playerData } = await supabase.from("player_stats").select("*").eq("player_name", playerName).single()

  if (!playerData) {
    redirect("/leaderboard")
  }

  // Get game history
  const { data: gameHistory } = await supabase
    .from("game_sessions")
    .select("*")
    .or(`team1.cs.{${playerName}},team2.cs.{${playerName}}`)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get detailed stats
  const { data: detailedStats } = await supabase
    .from("game_stats")
    .select("*")
    .eq("player_id", playerData.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get achievements
  const { data: merits } = await supabase
    .from("player_merits")
    .select("*")
    .eq("player_id", playerData.id)
    .order("created_at", { ascending: false })

  const { data: flags } = await supabase
    .from("player_flags")
    .select("*")
    .eq("player_id", playerData.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <PlayerProfile
        playerData={playerData}
        gameHistory={gameHistory || []}
        detailedStats={detailedStats || []}
        merits={merits || []}
        flags={flags || []}
        isOwnProfile={false}
      />
    </div>
  )
}
