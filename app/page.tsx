import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Trophy, Users, Calendar, Zap } from "lucide-react"

export default async function Home() {
  const supabase = createClient()

  // Get top players for preview
  const { data: topPlayers } = await supabase
    .from("players")
    .select("display_name, elo_rating, position")
    .order("elo_rating", { ascending: false })
    .limit(3)

  // Get upcoming tournaments
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("name, start_date, status")
    .eq("status", "upcoming")
    .order("start_date", { ascending: true })
    .limit(2)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Zealot Hockey Draft
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            The ultimate 4v4 hockey league management system. Draft teams, compete in tournaments, and climb the ELO
            rankings in real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              Join the League
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button size="lg" variant="outline">
              View Leaderboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Trophy className="h-8 w-8 text-orange-500 mb-2" />
            <CardTitle className="text-white">4v4 Drafts</CardTitle>
            <CardDescription>Captains with highest ELO draft their dream teams</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle className="text-white">Auction Leagues</CardTitle>
            <CardDescription>Bid on players in competitive auction-style drafts</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Calendar className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle className="text-white">Tournaments</CardTitle>
            <CardDescription>Scheduled tournaments with bracket-style competition</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Zap className="h-8 w-8 text-yellow-500 mb-2" />
            <CardTitle className="text-white">Real-time Scoring</CardTitle>
            <CardDescription>Live game updates with multiple scorers tracking events</CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Top Players Preview */}
      {topPlayers && topPlayers.length > 0 && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Top Players</h2>
            <p className="text-slate-400">Current ELO leaders</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {topPlayers.map((player, index) => (
              <Card key={player.display_name} className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-orange-500 mb-1">#{index + 1}</div>
                  <div className="text-lg font-semibold text-white mb-1">{player.display_name}</div>
                  <div className="text-slate-400 text-sm mb-2">{player.position}</div>
                  <div className="text-xl font-bold text-orange-500">{player.elo_rating} ELO</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/leaderboard">
              <Button variant="outline">View Full Leaderboard</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Upcoming Tournaments */}
      {tournaments && tournaments.length > 0 && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Upcoming Tournaments</h2>
            <p className="text-slate-400">Register now to compete</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.name} className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">{tournament.name}</CardTitle>
                  <CardDescription>
                    {tournament.start_date
                      ? new Date(tournament.start_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Date TBD"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">Register Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/tournaments">
              <Button variant="outline">View All Tournaments</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
