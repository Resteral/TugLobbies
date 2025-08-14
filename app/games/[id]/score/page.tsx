import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { LiveScoreboard } from "@/components/live-scoreboard"

export default async function GameScoringPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: game } = await supabase
    .from("games")
    .select(`
      *,
      team1:teams!games_team1_id_fkey(*),
      team2:teams!games_team2_id_fkey(*),
      tournament:tournaments(*)
    `)
    .eq("id", params.id)
    .single()

  if (!game) {
    notFound()
  }

  // Check if user is authorized to score this game
  const { data: isScorer } = await supabase
    .from("game_scorers")
    .select("id")
    .eq("game_id", params.id)
    .eq("user_id", user.id)
    .single()

  const { data: isCreator } = await supabase
    .from("tournaments")
    .select("id")
    .eq("id", game.tournament_id)
    .eq("creator_id", user.id)
    .single()

  if (!isScorer && !isCreator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You are not authorized to score this game.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Live Game Scoring</h1>
        <p className="text-slate-600">
          {game.team1?.name} vs {game.team2?.name}
        </p>
      </div>

      <LiveScoreboard game={game} />
    </div>
  )
}
