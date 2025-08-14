import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Trophy, Users, TrendingUp, BarChart3, DollarSign } from "lucide-react"
import { signOut } from "@/lib/actions"
import Link from "next/link"

export default async function Home() {
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

  // Get active lobbies with betting opportunities
  const { data: activeLobbies } = await supabase
    .from("lobbies")
    .select(`
      *,
      game_bets(amount, team_bet)
    `)
    .eq("status", "waiting")
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl font-bold">ELO Draft League</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {player.profile_picture && (
                  <img
                    src={player.profile_picture || "/placeholder.svg"}
                    alt={player.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-gray-300">Welcome, {player.name}</span>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Player Stats Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Player Profile</h2>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{player.elo_rating}</div>
              <div className="text-sm text-gray-400">ELO Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{player.wins}</div>
              <div className="text-sm text-gray-400">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{player.losses}</div>
              <div className="text-sm text-gray-400">Losses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {player.games_played > 0 ? ((player.wins / player.games_played) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/lobbies">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold">Join Lobby</h3>
                  <p className="text-gray-400">Find or create a game lobby</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/tournaments">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-semibold">Tournaments</h3>
                  <p className="text-gray-400">Compete in tournaments</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/stats">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold">Statistics</h3>
                  <p className="text-gray-400">View stats & export data</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/leaderboard">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold">Leaderboard</h3>
                  <p className="text-gray-400">View rankings</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Live Betting Opportunities */}
        {activeLobbies && activeLobbies.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-semibold">Live Betting Opportunities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLobbies.slice(0, 3).map((lobby) => {
                const totalBets = lobby.game_bets?.reduce((sum: number, bet: any) => sum + bet.amount, 0) || 0
                return (
                  <Link key={lobby.id} href={`/lobbies/${lobby.id}`}>
                    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold truncate">{lobby.name}</h3>
                        <span className="text-xs text-gray-400 capitalize">{lobby.lobby_type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {lobby.current_players?.length || 0}/{lobby.max_players} players
                        </span>
                        <span className="text-green-400 font-semibold">${totalBets}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-gray-400 text-center py-8">No recent games. Join a lobby to start playing!</div>
        </div>
      </main>
    </div>
  )
}
