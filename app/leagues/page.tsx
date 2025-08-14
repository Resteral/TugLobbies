import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DollarSign, Users, Calendar, Trophy, Plus } from "lucide-react"
import CreateAuctionLeagueForm from "@/components/create-auction-league-form"

export default async function LeaguesPage() {
  const supabase = createClient()

  // Get all auction leagues with team counts
  const { data: leagues } = await supabase
    .from("auction_leagues")
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
      ),
      player_pool (
        id,
        player_id,
        base_price,
        current_bid,
        is_available,
        players (
          display_name,
          elo_rating,
          position
        )
      )
    `)
    .order("created_at", { ascending: false })

  // Get current user's player profile
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentPlayer = null
  if (user) {
    const { data } = await supabase.from("players").select("*").eq("user_id", user.id).single()
    currentPlayer = data
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "setup":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "drafting":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "completed":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "setup":
        return <Users className="h-4 w-4" />
      case "drafting":
        return <DollarSign className="h-4 w-4" />
      case "active":
        return <Trophy className="h-4 w-4" />
      case "completed":
        return <Calendar className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Auction House Leagues</h1>
          <p className="text-slate-400 text-lg">Bid on players to build your dream team</p>
        </div>
        {currentPlayer && <CreateAuctionLeagueForm />}
      </div>

      {leagues && leagues.length > 0 ? (
        <div className="grid gap-6">
          {leagues.map((league) => {
            const registeredTeams = league.teams?.length || 0
            const totalPlayers = league.player_pool?.length || 0
            const availablePlayers = league.player_pool?.filter((p) => p.is_available).length || 0
            const isUserRegistered = league.teams?.some(
              (team) => team.players?.display_name && currentPlayer?.id === team.captain_id,
            )

            return (
              <Card key={league.id} className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-white text-xl">{league.name}</CardTitle>
                      <CardDescription>{league.description}</CardDescription>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {league.draft_date
                              ? new Date(league.draft_date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "Draft Date TBD"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Users className="h-4 w-4" />
                          <span>
                            {registeredTeams}/{league.max_teams} teams
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <DollarSign className="h-4 w-4" />
                          <span>${league.budget_cap} budget</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(league.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(league.status)}
                        <span className="capitalize">{league.status}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* League Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">${league.budget_cap}</div>
                      <div className="text-slate-400 text-sm">Budget Cap</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">{totalPlayers}</div>
                      <div className="text-slate-400 text-sm">Player Pool</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-400">{availablePlayers}</div>
                      <div className="text-slate-400 text-sm">Available</div>
                    </div>
                  </div>

                  {/* Season Schedule */}
                  {league.season_start && league.season_end && (
                    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-400 font-semibold">Season Schedule</span>
                        <span className="text-blue-400">
                          {new Date(league.season_start).toLocaleDateString()} -{" "}
                          {new Date(league.season_end).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Registered Teams Preview */}
                  {league.teams && league.teams.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold">Registered Teams</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {league.teams.map((team, index) => (
                          <div
                            key={team.id}
                            className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700"
                          >
                            <div className="text-xs text-slate-400 mb-1">Team #{index + 1}</div>
                            <div className="text-white font-semibold text-sm">
                              {team.players?.display_name || "Unknown"}
                            </div>
                            <div className="text-orange-500 text-xs font-bold">{team.players?.elo_rating || 0} ELO</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    {league.status === "drafting" ? (
                      <Link href={`/leagues/${league.id}/auction`}>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Join Live Auction
                        </Button>
                      </Link>
                    ) : currentPlayer ? (
                      isUserRegistered ? (
                        <Button disabled variant="outline">
                          Already Registered
                        </Button>
                      ) : registeredTeams >= league.max_teams ? (
                        <Button disabled variant="outline">
                          League Full
                        </Button>
                      ) : (
                        <Link href={`/leagues/${league.id}/register`}>
                          <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Join League
                          </Button>
                        </Link>
                      )
                    ) : (
                      <Link href="/auth/login">
                        <Button variant="outline">Login to Join</Button>
                      </Link>
                    )}

                    <Link href={`/leagues/${league.id}`}>
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
            <DollarSign className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Auction Leagues Yet</h3>
            <p className="text-slate-400 mb-6">Create the first auction league to get started!</p>
            {currentPlayer && <CreateAuctionLeagueForm />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
