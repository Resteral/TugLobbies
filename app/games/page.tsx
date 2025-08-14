import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function GamesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: games } = await supabase
    .from("games")
    .select(`
      *,
      team1:teams!games_team1_id_fkey(*),
      team2:teams!games_team2_id_fkey(*),
      tournament:tournaments(*)
    `)
    .order("scheduled_time", { ascending: true })

  const { data: myScorableGames } = await supabase
    .from("game_scorers")
    .select(`
      game_id,
      games(
        *,
        team1:teams!games_team1_id_fkey(*),
        team2:teams!games_team2_id_fkey(*),
        tournament:tournaments(*)
      )
    `)
    .eq("user_id", user.id)

  const scorableGameIds = myScorableGames?.map((gs) => gs.game_id) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Games</h1>
        <p className="text-slate-600">View and score hockey games in real-time</p>
      </div>

      {/* My Scorable Games */}
      {myScorableGames && myScorableGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Games I Can Score</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myScorableGames.map((gameScorer) => {
              const game = gameScorer.games
              if (!game) return null

              return (
                <Card key={game.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {game.team1?.name} vs {game.team2?.name}
                      </CardTitle>
                      <Badge variant={game.status === "in_progress" ? "default" : "secondary"}>
                        {game.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-center">
                        {game.team1_score} - {game.team2_score}
                      </div>
                      <div className="text-sm text-slate-600">{game.tournament?.name}</div>
                      <div className="text-sm text-slate-600">{new Date(game.scheduled_time).toLocaleString()}</div>
                      <Link href={`/games/${game.id}/score`}>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                          {game.status === "in_progress" ? "Score Live" : "View Game"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* All Games */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">All Games</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games?.map((game) => (
            <Card key={game.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {game.team1?.name} vs {game.team2?.name}
                  </CardTitle>
                  <Badge variant={game.status === "in_progress" ? "default" : "secondary"}>
                    {game.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-center">
                    {game.team1_score} - {game.team2_score}
                  </div>
                  <div className="text-sm text-slate-600">{game.tournament?.name}</div>
                  <div className="text-sm text-slate-600">{new Date(game.scheduled_time).toLocaleString()}</div>
                  <div className="flex space-x-2">
                    <Link href={`/games/${game.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        View Details
                      </Button>
                    </Link>
                    {scorableGameIds.includes(game.id) && (
                      <Link href={`/games/${game.id}/score`} className="flex-1">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">Score</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {!games || games.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">No games scheduled yet</p>
          <Link href="/tournaments">
            <Button className="bg-orange-600 hover:bg-orange-700">Create Tournament</Button>
          </Link>
        </div>
      ) : null}
    </div>
  )
}
