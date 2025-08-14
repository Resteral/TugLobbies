import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import PlayerStatsCard from "@/components/player-stats-card"
import ActiveLobbies from "@/components/active-lobbies"
import QuickActions from "@/components/quick-actions"
import RecentGames from "@/components/recent-games"
import TournamentInfo from "@/components/tournament-info"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get player data
  const { data: playerData } = await supabase.from("player_stats").select("*").eq("id", user.id).single()

  // Get active lobbies
  const { data: lobbies } = await supabase
    .from("lobbies")
    .select("*")
    .eq("status", "waiting")
    .order("created_at", { ascending: false })
    .limit(6)

  // Get recent games
  const { data: recentGames } = await supabase
    .from("game_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get active tournaments
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .in("status", ["registration", "active"])
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <DashboardHeader user={user} playerData={playerData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <PlayerStatsCard playerData={playerData} />
            <ActiveLobbies lobbies={lobbies || []} />
            <RecentGames games={recentGames || []} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <QuickActions />
            <TournamentInfo tournaments={tournaments || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
