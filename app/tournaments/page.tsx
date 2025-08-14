import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TournamentBrowser from "@/components/tournament-browser"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function TournamentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all tournaments
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, tournament_participants(count)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Tournaments</h1>
          </div>

          <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
            <Link href="/tournament/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Link>
          </Button>
        </div>

        <TournamentBrowser tournaments={tournaments || []} />
      </div>
    </div>
  )
}
