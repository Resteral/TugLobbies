import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, Lock, Globe } from "lucide-react"
import Link from "next/link"
import CreateLobbyForm from "@/components/create-lobby-form"

export default async function LobbiesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get player profile
  const { data: player } = await supabase.from("players").select("*").eq("id", user.id).single()

  if (!player) {
    redirect("/auth/login")
  }

  // Get all active lobbies
  const { data: lobbies } = await supabase
    .from("lobbies")
    .select("*")
    .eq("status", "waiting")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  ← Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Game Lobbies</h1>
            </div>
            <CreateLobbyForm playerName={player.name} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Lobbies */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Lobbies</h2>
          {lobbies && lobbies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lobbies.map((lobby) => (
                <div key={lobby.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{lobby.name}</h3>
                    <div className="flex items-center space-x-2">
                      {lobby.is_private ? (
                        <Lock className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-green-400" />
                      )}
                      <span className="text-sm text-gray-400">{lobby.is_private ? "Private" : "Public"}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Host:</span>
                      <span>{lobby.host_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Players:</span>
                      <span>
                        {lobby.current_players?.length || 0}/{lobby.max_players}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Type:</span>
                      <span className="capitalize">{lobby.lobby_type}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/lobbies/${lobby.id}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Users className="h-4 w-4 mr-2" />
                        Join Lobby
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Lobbies</h3>
              <p className="text-gray-400 mb-4">Be the first to create a lobby and start a game!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
