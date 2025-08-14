import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user's active drafts
  const { data: activeDrafts } = await supabase
    .from("drafts")
    .select(`
      *,
      draft_registrations!inner(*)
    `)
    .eq("draft_registrations.user_id", user.id)
    .eq("status", "active")

  // Get user's tournaments
  const { data: tournaments } = await supabase.from("tournaments").select("*").eq("status", "active").limit(5)

  // Get user's auction leagues
  const { data: auctionLeagues } = await supabase
    .from("auction_leagues")
    .select(`
      *,
      auction_teams!inner(*)
    `)
    .eq("auction_teams.user_id", user.id)
    .eq("status", "active")

  // Get recent games
  const { data: recentGames } = await supabase
    .from("games")
    .select(`
      *,
      team1:teams!games_team1_id_fkey(name),
      team2:teams!games_team2_id_fkey(name)
    `)
    .order("scheduled_time", { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to Zealot Hockey</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Drafts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Drafts</CardTitle>
            <CardDescription>Your current draft sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {activeDrafts?.length ? (
              <div className="space-y-2">
                {activeDrafts.map((draft) => (
                  <Link key={draft.id} href={`/draft/${draft.id}`}>
                    <div className="p-2 rounded border hover:bg-accent">
                      <div className="font-medium">{draft.name}</div>
                      <Badge variant="secondary">{draft.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active drafts</p>
            )}
          </CardContent>
        </Card>

        {/* Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle>Active Tournaments</CardTitle>
            <CardDescription>Ongoing competitions</CardDescription>
          </CardHeader>
          <CardContent>
            {tournaments?.length ? (
              <div className="space-y-2">
                {tournaments.map((tournament) => (
                  <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                    <div className="p-2 rounded border hover:bg-accent">
                      <div className="font-medium">{tournament.name}</div>
                      <Badge variant="secondary">{tournament.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active tournaments</p>
            )}
          </CardContent>
        </Card>

        {/* Auction Leagues */}
        <Card>
          <CardHeader>
            <CardTitle>Auction Leagues</CardTitle>
            <CardDescription>Your fantasy leagues</CardDescription>
          </CardHeader>
          <CardContent>
            {auctionLeagues?.length ? (
              <div className="space-y-2">
                {auctionLeagues.map((league) => (
                  <Link key={league.id} href={`/leagues/${league.id}`}>
                    <div className="p-2 rounded border hover:bg-accent">
                      <div className="font-medium">{league.name}</div>
                      <Badge variant="secondary">{league.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No auction leagues</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Games */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
            <CardDescription>Latest game results and upcoming matches</CardDescription>
          </CardHeader>
          <CardContent>
            {recentGames?.length ? (
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-3 rounded border">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {game.team1?.name} vs {game.team2?.name}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(game.scheduled_time).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {game.team1_score !== null && game.team2_score !== null ? (
                        <div className="text-lg font-bold">
                          {game.team1_score} - {game.team2_score}
                        </div>
                      ) : null}
                      <Badge variant={game.status === "completed" ? "default" : "secondary"}>{game.status}</Badge>
                      <Link href={`/games/${game.id}/score`}>
                        <Badge variant="outline">Score</Badge>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent games</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
