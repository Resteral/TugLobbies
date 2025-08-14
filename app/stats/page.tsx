import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, BarChart3, Trophy, Users } from "lucide-react"
import Link from "next/link"
import StatsExportForm from "@/components/stats-export-form"

export default async function StatsPage() {
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

  // Get recent games for export
  const { data: recentGames } = await supabase
    .from("game_sessions")
    .select(`
      *,
      game_stats(*)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  // Get player statistics
  const { data: playerStats } = await supabase
    .from("players")
    .select("name, elo_rating, wins, losses, games_played")
    .order("elo_rating", { ascending: false })
    .limit(100)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Statistics & Data Export</h1>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Options */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Download className="h-5 w-5 text-green-400" />
                <h2 className="text-xl font-semibold">Data Export</h2>
              </div>
              <StatsExportForm recentGames={recentGames || []} playerStats={playerStats || []} />
            </div>

            {/* Recent Games Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Games</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Game ID</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Winner</th>
                      <th className="text-left py-2">Duration</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGames && recentGames.length > 0 ? (
                      recentGames.slice(0, 10).map((game) => (
                        <tr key={game.id} className="border-b border-gray-700/50">
                          <td className="py-2 font-mono text-xs">{game.id.slice(0, 8)}...</td>
                          <td className="py-2">{new Date(game.created_at).toLocaleDateString()}</td>
                          <td className="py-2 capitalize">{game.game_type}</td>
                          <td className="py-2">
                            <span className={game.winning_team === "team1" ? "text-blue-400" : "text-red-400"}>
                              Team {game.winning_team?.slice(-1)}
                            </span>
                          </td>
                          <td className="py-2">{game.duration_minutes || "N/A"}m</td>
                          <td className="py-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          No games found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <h2 className="text-xl font-semibold">Your Stats</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">ELO Rating</span>
                  <span className="font-semibold text-blue-400">{player.elo_rating || 1200}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Games Played</span>
                  <span className="font-semibold">{player.games_played || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wins</span>
                  <span className="font-semibold text-green-400">{player.wins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Losses</span>
                  <span className="font-semibold text-red-400">{player.losses || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="font-semibold">
                    {player.games_played > 0 ? ((player.wins / player.games_played) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-purple-400" />
                <h2 className="text-xl font-semibold">Top Players</h2>
              </div>
              <div className="space-y-3">
                {playerStats?.slice(0, 5).map((p, index) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm">{p.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-400">{p.elo_rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
