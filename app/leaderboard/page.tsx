import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Leaderboard from "@/components/leaderboard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get top players by ELO
  const { data: topPlayers } = await supabase
    .from("player_stats")
    .select("*")
    .order("elo", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-8 text-center">Leaderboard</h1>

        <Leaderboard players={topPlayers || []} />
      </div>
    </div>
  )
}
