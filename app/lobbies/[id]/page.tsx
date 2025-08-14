import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Crown, ArrowLeft } from "lucide-react"
import Link from "next/link"
import JoinLobbyButton from "@/components/join-lobby-button"
import LeaveLobbyButton from "@/components/leave-lobby-button"
import StartGameButton from "@/components/start-game-button"
import LobbyBetting from "@/components/lobby-betting"

interface LobbyPageProps {
  params: {
    id: string
  }
}

export default async function LobbyPage({ params }: LobbyPageProps) {
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

  // Get lobby details
  const { data: lobby } = await supabase.from("lobbies").select("*").eq("id", params.id).single()

  if (!lobby) {
    notFound()
  }

  // Get lobby players
  const { data: lobbyPlayers } = await supabase
    .from("lobby_players")
    .select("*")
    .eq("lobby_id", params.id)
    .order("joined_at", { ascending: true })

  const isHost = lobby.host_name === player.name
  const isPlayerInLobby = lobbyPlayers?.some((p) => p.player_name === player.name)
  const canJoin = !isPlayerInLobby && (lobbyPlayers?.length || 0) < lobby.max_players

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/lobbies">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lobbies
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{lobby.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-400">
                Status: <span className="text-green-400 capitalize">{lobby.status}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lobby Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Lobby Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Host</div>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    <span>{lobby.host_name}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Type</div>
                  <div className="capitalize">{lobby.lobby_type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Players</div>
                  <div>
                    {lobbyPlayers?.length || 0}/{lobby.max_players}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Privacy</div>
                  <div>{lobby.is_private ? "Private" : "Public"}</div>
                </div>
              </div>
            </div>

            {/* Players List */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Players</h2>
              <div className="space-y-3">
                {lobbyPlayers && lobbyPlayers.length > 0 ? (
                  lobbyPlayers.map((lobbyPlayer, index) => (
                    <div key={lobbyPlayer.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{lobbyPlayer.player_name}</div>
                          <div className="text-sm text-gray-400">
                            {lobbyPlayer.player_name === lobby.host_name && (
                              <span className="text-yellow-400">Host</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lobbyPlayer.is_ready ? (
                          <span className="text-green-400 text-sm">Ready</span>
                        ) : (
                          <span className="text-yellow-400 text-sm">Not Ready</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">No players in lobby yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            <LobbyBetting lobbyId={params.id} currentPlayer={player} lobbyPlayers={lobbyPlayers || []} />

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                {canJoin && <JoinLobbyButton lobbyId={params.id} playerName={player.name} />}

                {isPlayerInLobby && !isHost && <LeaveLobbyButton lobbyId={params.id} playerName={player.name} />}

                {isHost && (
                  <>
                    <StartGameButton lobbyId={params.id} playerCount={lobbyPlayers?.length || 0} minPlayers={2} />
                    <Button variant="destructive" className="w-full">
                      Close Lobby
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Game Rules</h2>
              <div className="space-y-2 text-sm text-gray-400">
                <div>• 4v4 team-based matches</div>
                <div>• ELO-based captain selection</div>
                <div>• Draft or auction format</div>
                <div>• Win/loss affects ELO rating</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
