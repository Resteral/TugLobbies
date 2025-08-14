import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Users, Trophy, Play } from "lucide-react"
import DraftRoom from "@/components/draft-room"

interface Props {
  params: { id: string }
}

export default async function DraftDetailsPage({ params }: Props) {
  const supabase = createClient()

  // Get tournament with teams and draft events
  const { data: tournament } = await supabase
    .from("tournaments")
    .select(`
      *,
      teams (
        id,
        name,
        captain_id,
        color,
        players:players!teams_captain_id_fkey (
          id,
          display_name,
          elo_rating,
          position,
          user_id
        ),
        team_members (
          id,
          player_id,
          is_captain,
          players (
            id,
            display_name,
            elo_rating,
            position
          )
        )
      ),
      draft_events (
        id,
        team_id,
        player_id,
        pick_number,
        round_number,
        created_at,
        players (
          display_name,
          elo_rating,
          position
        ),
        teams (
          name,
          players:players!teams_captain_id_fkey (
            display_name
          )
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (!tournament) {
    redirect("/draft")
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentPlayer = null
  if (user) {
    const { data } = await supabase.from("players").select("*").eq("user_id", user.id).single()
    currentPlayer = data
  }

  // Check if user is a captain in this tournament
  const userTeam = tournament.teams?.find((team) => team.captain_id === currentPlayer?.id)
  const isUserCaptain = !!userTeam

  // Get available players for draft (not already on teams)
  const { data: availablePlayers } = await supabase
    .from("players")
    .select("*")
    .eq("is_active", true)
    .not("id", "in", `(${tournament.teams?.map((t) => t.captain_id).join(",") || "null"})`)

  // Sort teams by captain ELO (highest first) for draft order
  const sortedTeams = tournament.teams?.sort((a, b) => (b.players?.elo_rating || 0) - (a.players?.elo_rating || 0))

  return (
    <div className="space-y-8">
      {/* Tournament Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{tournament.name}</h1>
            <p className="text-slate-400 text-lg">{tournament.description}</p>
          </div>
          <Badge
            variant={tournament.status === "active" ? "default" : "secondary"}
            className={
              tournament.status === "active"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : tournament.status === "upcoming"
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  : "bg-slate-500/20 text-slate-400 border-slate-500/30"
            }
          >
            {tournament.status === "active"
              ? "Live Draft"
              : tournament.status === "upcoming"
                ? "Registration Open"
                : "Completed"}
          </Badge>
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1 text-slate-400">
            <Calendar className="h-4 w-4" />
            <span>
              {tournament.start_date
                ? new Date(tournament.start_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
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
              {tournament.teams?.length || 0}/{tournament.max_teams} teams
            </span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <Trophy className="h-4 w-4" />
            <span>{tournament.tournament_type} format</span>
          </div>
        </div>
      </div>

      {/* Live Draft Interface */}
      {tournament.status === "active" && (
        <DraftRoom
          tournament={tournament}
          teams={sortedTeams || []}
          availablePlayers={availablePlayers || []}
          currentPlayer={currentPlayer}
          userTeam={userTeam}
          draftEvents={tournament.draft_events || []}
        />
      )}

      {/* Registration/Management Actions */}
      {tournament.status === "upcoming" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Tournament Management</CardTitle>
            <CardDescription>Registration and draft controls</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            {currentPlayer ? (
              isUserCaptain ? (
                <Button disabled variant="outline">
                  Already Registered
                </Button>
              ) : (tournament.teams?.length || 0) >= tournament.max_teams ? (
                <Button disabled variant="outline">
                  Tournament Full
                </Button>
              ) : (
                <Link href={`/draft/${params.id}/register`}>
                  <Button className="bg-orange-600 hover:bg-orange-700">Register as Captain</Button>
                </Link>
              )
            ) : (
              <Link href="/auth/login">
                <Button variant="outline">Login to Register</Button>
              </Link>
            )}

            {/* Tournament creator can start draft */}
            {currentPlayer?.id === tournament.created_by && (tournament.teams?.length || 0) >= 4 && (
              <form action={`/api/draft/${params.id}/start`} method="POST">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Start Draft
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teams Display */}
      {sortedTeams && sortedTeams.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            {tournament.status === "active" ? "Draft Order" : "Registered Teams"}
          </h2>
          <div className="grid gap-4">
            {sortedTeams.map((team, index) => (
              <Card key={team.id} className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-slate-800 rounded-full text-white font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                        <p className="text-slate-400 text-sm">
                          Captain: {team.players?.display_name} ({team.players?.elo_rating} ELO)
                        </p>
                      </div>
                    </div>
                    {isUserCaptain && userTeam?.id === team.id && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Your Team</Badge>
                    )}
                  </div>

                  {/* Team Members */}
                  {team.team_members && team.team_members.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold text-sm">Team Members:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {team.team_members.map((member) => (
                          <div key={member.id} className="bg-slate-800 rounded p-2 text-center">
                            <div className="text-white text-sm font-semibold">{member.players?.display_name}</div>
                            <div className="text-slate-400 text-xs">{member.players?.position}</div>
                            <div className="text-orange-500 text-xs">{member.players?.elo_rating} ELO</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
