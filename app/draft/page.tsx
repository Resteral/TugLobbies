import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, Calendar, Trophy, Plus } from "lucide-react"
import CreateDraftForm from "@/components/create-draft-form"

export default async function DraftPage() {
  const supabase = createClient()

  // Get upcoming drafts/tournaments
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select(`
      *,
      teams (
        id,
        name,
        captain_id,
        players:players!teams_captain_id_fkey (
          display_name,
          elo_rating
        )
      )
    `)
    .in("status", ["upcoming", "active"])
    .order("start_date", { ascending: true })

  // Get current user's player profile
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentPlayer = null
  if (user) {
    const { data } = await supabase.from("players").select("*").eq("user_id", user.id).single()
    currentPlayer = data
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">4v4 Draft System</h1>
          <p className="text-slate-400 text-lg">Captains with highest ELO draft their teams</p>
        </div>
        {currentPlayer && <CreateDraftForm />}
      </div>

      {tournaments && tournaments.length > 0 ? (
        <div className="grid gap-6">
          {tournaments.map((tournament) => {
            const registeredTeams = tournament.teams?.length || 0
            const isUserRegistered = tournament.teams?.some(
              (team) => team.players?.display_name && currentPlayer?.id === team.captain_id,
            )

            return (
              <Card key={tournament.id} className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-white text-xl">{tournament.name}</CardTitle>
                      <CardDescription>{tournament.description}</CardDescription>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {tournament.start_date
                              ? new Date(tournament.start_date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "Date TBD"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Users className="h-4 w-4" />
                          <span>
                            {registeredTeams}/{tournament.max_teams} teams
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={tournament.status === "active" ? "default" : "secondary"}
                      className={
                        tournament.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }
                    >
                      {tournament.status === "active" ? "Live Draft" : "Registration Open"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Registered Captains */}
                  {tournament.teams && tournament.teams.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold">Registered Captains</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {tournament.teams
                          .sort((a, b) => (b.players?.elo_rating || 0) - (a.players?.elo_rating || 0))
                          .map((team, index) => (
                            <div
                              key={team.id}
                              className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700"
                            >
                              <div className="text-xs text-slate-400 mb-1">Captain #{index + 1}</div>
                              <div className="text-white font-semibold text-sm">
                                {team.players?.display_name || "Unknown"}
                              </div>
                              <div className="text-orange-500 text-xs font-bold">
                                {team.players?.elo_rating || 0} ELO
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    {tournament.status === "active" ? (
                      <Link href={`/draft/${tournament.id}`}>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Trophy className="h-4 w-4 mr-2" />
                          Join Live Draft
                        </Button>
                      </Link>
                    ) : currentPlayer ? (
                      isUserRegistered ? (
                        <Button disabled variant="outline">
                          Already Registered
                        </Button>
                      ) : registeredTeams >= tournament.max_teams ? (
                        <Button disabled variant="outline">
                          Tournament Full
                        </Button>
                      ) : (
                        <Link href={`/draft/${tournament.id}/register`}>
                          <Button className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Register as Captain
                          </Button>
                        </Link>
                      )
                    ) : (
                      <Link href="/auth/login">
                        <Button variant="outline">Login to Register</Button>
                      </Link>
                    )}

                    <Link href={`/draft/${tournament.id}`}>
                      <Button variant="ghost">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Drafts</h3>
            <p className="text-slate-400 mb-6">Create the first draft tournament to get started!</p>
            {currentPlayer && <CreateDraftForm />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
