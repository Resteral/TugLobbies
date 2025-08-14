import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LobbyBrowser from "@/components/lobby-browser"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function LobbiesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all active lobbies
  const { data: lobbies } = await supabase
    .from("lobbies")
    .select("*")
    .eq("status", "waiting")
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
            <h1 className="text-3xl font-bold text-white">Browse Lobbies</h1>
          </div>

          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/lobby/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Lobby
            </Link>
          </Button>
        </div>

        <LobbyBrowser lobbies={lobbies || []} />
      </div>
    </div>
  )
}
