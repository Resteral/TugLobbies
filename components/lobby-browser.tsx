"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lock, Globe, Clock, Trophy } from "lucide-react"
import { joinLobby } from "@/lib/lobby-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface LobbyBrowserProps {
  lobbies: any[]
}

export default function LobbyBrowser({ lobbies }: LobbyBrowserProps) {
  const router = useRouter()
  const [joiningLobby, setJoiningLobby] = useState<string | null>(null)

  const handleJoinLobby = async (lobbyId: string) => {
    setJoiningLobby(lobbyId)
    const result = await joinLobby(lobbyId)

    if (result?.error) {
      alert(result.error)
      setJoiningLobby(null)
    } else {
      router.push(`/lobby/${lobbyId}`)
    }
  }

  const getGameTypeIcon = (type: string) => {
    switch (type) {
      case "tournament":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      default:
        return <Users className="h-4 w-4 text-blue-500" />
    }
  }

  const getGameTypeLabel = (type: string) => {
    switch (type) {
      case "4v4_draft":
        return "4v4 Draft"
      case "3v3_casual":
        return "3v3 Casual"
      case "2v2_ranked":
        return "2v2 Ranked"
      case "tournament":
        return "Tournament"
      default:
        return type
    }
  }

  if (lobbies.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="h-16 w-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold text-white mb-2">No Active Lobbies</h2>
        <p className="text-gray-400 mb-6">Be the first to create a lobby!</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <a href="/lobby/create">Create Lobby</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lobbies.map((lobby) => (
        <Card key={lobby.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {lobby.is_private ? (
                    <Lock className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-500" />
                  )}
                  <h3 className="font-semibold text-white truncate">{lobby.name}</h3>
                </div>
                <p className="text-sm text-gray-400">Host: {lobby.host_name}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  {getGameTypeIcon(lobby.lobby_type)}
                  <span>{getGameTypeLabel(lobby.lobby_type)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>
                    {lobby.current_players?.length || 0}/{lobby.max_players} players
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(lobby.created_at).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((lobby.current_players?.length || 0) / lobby.max_players) * 100}%`,
                  }}
                />
              </div>
            </div>

            <Button
              onClick={() => handleJoinLobby(lobby.id)}
              disabled={joiningLobby === lobby.id || (lobby.current_players?.length || 0) >= lobby.max_players}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {joiningLobby === lobby.id
                ? "Joining..."
                : (lobby.current_players?.length || 0) >= lobby.max_players
                  ? "Full"
                  : "Join Lobby"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
