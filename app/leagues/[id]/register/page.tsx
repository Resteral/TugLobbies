import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RegisterForAuctionForm from "@/components/register-for-auction-form"

interface Props {
  params: { id: string }
}

export default async function RegisterForAuctionPage({ params }: Props) {
  const supabase = createClient()

  // Get league details
  const { data: league } = await supabase
    .from("auction_leagues")
    .select(`
      *,
      teams (
        id,
        captain_id,
        players:players!teams_captain_id_fkey (
          display_name,
          elo_rating
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (!league) {
    redirect("/leagues")
  }

  if (league.status !== "setup") {
    redirect(`/leagues/${params.id}`)
  }

  // Check if user is authenticated and has profile
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: player } = await supabase.from("players").select("*").eq("user_id", user.id).single()

  if (!player) {
    redirect("/profile/setup")
  }

  // Check if already registered
  const isAlreadyRegistered = league.teams?.some((team) => team.captain_id === player.id)

  if (isAlreadyRegistered) {
    redirect(`/leagues/${params.id}`)
  }

  const registeredTeams = league.teams?.length || 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Join Auction League</h1>
        <p className="text-slate-400">Register your team for the auction</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">{league.name}</CardTitle>
          <CardDescription>{league.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Auction Date:</span>
              <div className="text-white font-semibold">
                {league.draft_date
                  ? new Date(league.draft_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "TBD"}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Budget Cap:</span>
              <div className="text-green-400 font-semibold text-lg">${league.budget_cap}</div>
            </div>
            <div>
              <span className="text-slate-400">Teams:</span>
              <div className="text-white font-semibold">
                {registeredTeams}/{league.max_teams}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Season:</span>
              <div className="text-white font-semibold">
                {league.season_start && league.season_end
                  ? `${new Date(league.season_start).toLocaleDateString()} - ${new Date(league.season_end).toLocaleDateString()}`
                  : "TBD"}
              </div>
            </div>
          </div>

          {registeredTeams >= league.max_teams ? (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">
              This league is full. Registration is closed.
            </div>
          ) : (
            <>
              <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded">
                <h4 className="font-semibold mb-1">Auction League Rules:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Each team gets a ${league.budget_cap} budget to bid on players</li>
                  <li>• Players have base prices based on their ELO ratings</li>
                  <li>• Highest bidder wins the player for their team</li>
                  <li>• You must be present for the live auction</li>
                  <li>• Season games will be scheduled after auction completes</li>
                </ul>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Your Profile:</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">{player.display_name}</div>
                    <div className="text-slate-400 text-sm">@{player.username}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">{player.elo_rating}</div>
                    <div className="text-slate-400 text-sm">ELO Rating</div>
                  </div>
                </div>
              </div>

              <RegisterForAuctionForm leagueId={params.id} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
