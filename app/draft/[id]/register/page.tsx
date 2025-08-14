import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RegisterForDraftForm from "@/components/register-for-draft-form"

interface Props {
  params: { id: string }
}

export default async function RegisterForDraftPage({ params }: Props) {
  const supabase = createClient()

  // Get tournament details
  const { data: tournament } = await supabase
    .from("tournaments")
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

  if (!tournament) {
    redirect("/draft")
  }

  if (tournament.status !== "upcoming") {
    redirect(`/draft/${params.id}`)
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
  const isAlreadyRegistered = tournament.teams?.some((team) => team.captain_id === player.id)

  if (isAlreadyRegistered) {
    redirect(`/draft/${params.id}`)
  }

  const registeredTeams = tournament.teams?.length || 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Register for Draft</h1>
        <p className="text-slate-400">Join as a captain in this tournament</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">{tournament.name}</CardTitle>
          <CardDescription>{tournament.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Draft Date:</span>
              <div className="text-white font-semibold">
                {tournament.start_date
                  ? new Date(tournament.start_date).toLocaleDateString("en-US", {
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
              <span className="text-slate-400">Teams:</span>
              <div className="text-white font-semibold">
                {registeredTeams}/{tournament.max_teams}
              </div>
            </div>
          </div>

          {registeredTeams >= tournament.max_teams ? (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">
              This tournament is full. Registration is closed.
            </div>
          ) : (
            <>
              <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded">
                <h4 className="font-semibold mb-1">Captain Requirements:</h4>
                <ul className="text-sm space-y-1">
                  <li>• You will be responsible for drafting your team</li>
                  <li>• Draft order is determined by ELO rating (highest picks first)</li>
                  <li>• You must be present for the live draft</li>
                  <li>• Teams will be 4 players each (including captain)</li>
                </ul>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Your Captain Profile:</h4>
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

              <RegisterForDraftForm tournamentId={params.id} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
