import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, DollarSign, Users, Trophy, Play } from "lucide-react"

interface Props {
  params: { id: string }
}

export default async function AuctionLeagueDetailsPage({ params }: Props) {
  const supabase = createClient()

  // Get league with all related data
  const { data: league } = await supabase
    .from("auction_leagues")
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
      player_pool (
        id,
        player_id,
        base_price,
        current_bid,
        winning_team_id,
        is_available,
        players (
          id,
          display_name,
          elo_rating,
          position,
          username
        ),
        winning_team:teams!player_pool_winning_team_id_fkey (
          name,
          players:players!teams_captain_id_fkey (
            display_name
          )
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (!league) {
    redirect("/leagues")
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

  const isCreator = currentPlayer?.id === league.created_by
  const registeredTeams = league.teams?.length || 0
  const userTeam = league.teams?.find((team) => team.captain_id === currentPlayer?.id)

  // Calculate team budgets
  const teamBudgets = league.teams?.map((team) => {
    const spent =
      league.player_pool?.filter((p) => p.winning_team_id === team.id).reduce((sum, p) => sum + p.current_bid, 0) || 0
    return {
      ...team,
      spent,
      remaining: league.budget_cap - spent,
    }
  })

  return (
    <div className="space-y-8">
      {/* League Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{league.name}</h1>
            <p className="text-slate-400 text-lg">{league.description}</p>
          </div>
          <Badge
            className={
              league.status === "drafting"
                ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                : league.status === "active"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : league.status === "setup"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-slate-500/20 text-slate-400 border-slate-500/30"
            }
          >
            {league.status === "drafting"
              ? "Live Auction"
              : league.status === "active"
                ? "Season Active"
                : league.status === "setup"
                  ? "Registration Open"
                  : "Completed"}
          </Badge>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-white font-semibold">${league.budget_cap}</div>
              <div className="text-slate-400 text-sm">Budget Cap</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-white font-semibold">{registeredTeams}</div>
              <div className="text-slate-400 text-sm">Teams</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-white font-semibold">{league.player_pool?.length || 0}</div>
              <div className="text-slate-400 text-sm">Player Pool</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-white font-semibold">
                {league.draft_date
                  ? new Date(league.draft_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "TBD"}
              </div>
              <div className="text-slate-400 text-sm">Auction Date</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* League Management */}
      {isCreator && league.status === "setup" && registeredTeams >= 4 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">League Management</CardTitle>
            <CardDescription>Start the auction when ready</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={`/api/leagues/${params.id}/start-auction`} method="POST">
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                <Play className="h-4 w-4 mr-2" />
                Start Auction
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Live Auction */}
      {league.status === "drafting" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Live Auction</CardTitle>
            <CardDescription>Bid on players to build your team</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/leagues/${params.id}/auction`}>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Join Auction Room
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Team Budgets */}
      {teamBudgets && teamBudgets.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Team Budgets</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {teamBudgets
              .sort((a, b) => b.spent - a.spent)
              .map((team) => (
                <Card key={team.id} className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                        <p className="text-slate-400 text-sm">Captain: {team.players?.display_name}</p>
                      </div>
                      {userTeam?.id === team.id && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Your Team</Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Spent</span>
                        <span className="text-red-400 font-semibold">${team.spent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Remaining</span>
                        <span className="text-green-400 font-semibold">${team.remaining}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(team.spent / league.budget_cap) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Team Roster */}
                    {team.team_members && team.team_members.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-white font-semibold text-sm">Roster:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {team.team_members.map((member) => (
                            <div key={member.id} className="bg-slate-800 rounded p-2 text-center">
                              <div className="text-white text-sm font-semibold">{member.players?.display_name}</div>
                              <div className="text-slate-400 text-xs">{member.players?.position}</div>
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

      {/* Registration CTA */}
      {league.status === "setup" && registeredTeams < league.max_teams && !userTeam && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Join This Auction League</h3>
            <p className="text-slate-400 mb-6">Register your team and get ready to bid on players</p>
            <Link href={`/leagues/${params.id}/register`}>
              <Button className="bg-green-600 hover:bg-green-700">Register Team</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
