"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Crown, Check, X, ArrowLeft, Play } from "lucide-react"
import Link from "next/link"
import { leaveLobby, toggleReady, initializeDraft } from "@/lib/lobby-actions"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface LobbyRoomProps {
  lobby: any
  players: any[]
  currentPlayer: any
  userId: string
}

export default function LobbyRoom({ lobby, players: initialPlayers, currentPlayer, userId }: LobbyRoomProps) {
  const router = useRouter()
  const [players, setPlayers] = useState(initialPlayers)
  const [lobbyData, setLobbyData] = useState(lobby)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isStartingDraft, setIsStartingDraft] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Create audio context for game start sound
    audioRef.current = new Audio()
    audioRef.current.preload = "auto"

    // Use a hockey-themed sound effect URL or create one programmatically
    const createGameStartSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Create a hockey horn-like sound
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1.5)
    }

    // Store the sound creation function
    audioRef.current.playGameStart = createGameStartSound

    return () => {
      if (audioRef.current) {
        audioRef.current = null
      }
    }
  }, [])

  // Set up real-time subscriptions
  useEffect(() => {
    const lobbySubscription = supabase
      .channel(`lobby_${lobby.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobby_players",
          filter: `lobby_id=eq.${lobby.id}`,
        },
        (payload) => {
          // Refresh players data
          supabase
            .from("lobby_players")
            .select("*")
            .eq("lobby_id", lobby.id)
            .order("joined_at", { ascending: true })
            .then(({ data }) => {
              if (data) setPlayers(data)
            })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobbies",
          filter: `id=eq.${lobby.id}`,
        },
        (payload) => {
          if (payload.new) {
            setLobbyData(payload.new)
            // If lobby status changed to drafting, redirect to draft
            if (payload.new.status === "drafting") {
              router.push(`/draft/${lobby.id}`)
            }
          }
        },
      )
      .subscribe()

    return () => {
      lobbySubscription.unsubscribe()
    }
  }, [lobby.id, supabase, router])

  const handleStartGame = async () => {
    setIsStartingDraft(true)

    try {
      if (audioRef.current && audioRef.current.playGameStart) {
        audioRef.current.playGameStart()
      }
    } catch (error) {
      console.log("Could not play sound:", error)
    }

    if (lobbyData.lobby_type === "4v4_draft") {
      const result = await initializeDraft(lobby.id)
      if (result?.error) {
        alert(result.error)
        setIsStartingDraft(false)
      } else {
        router.push(`/draft/${lobby.id}`)
      }
    } else {
      const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Simple team assignment for non-draft games
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)
      const team1 = shuffledPlayers.slice(0, Math.ceil(shuffledPlayers.length / 2)).map((p) => p.player_name)
      const team2 = shuffledPlayers.slice(Math.ceil(shuffledPlayers.length / 2)).map((p) => p.player_name)

      const { error: gameError } = await supabase.from("game_sessions").insert({
        id: gameId,
        lobby_id: lobby.id,
        team1,
        team2,
        team1_score: 0,
        team2_score: 0,
        status: "active",
      })

      if (gameError) {
        alert("Failed to create game session")
        setIsStartingDraft(false)
      } else {
        await supabase.from("lobbies").update({ status: "in_game" }).eq("id", lobby.id)
        router.push(`/game/${gameId}`)
      }
    }
  }

  const handleLeaveLobby = async () => {
    setIsLeaving(true)
    await leaveLobby(lobby.id)
  }

  const handleToggleReady = async () => {
    await toggleReady(lobby.id)
  }

  const currentPlayerInLobby = players.find((p) => p.player_name === currentPlayer?.player_name)
  const allPlayersReady = players.length >= 4 && players.every((p) => p.is_ready)
  const isHost = currentPlayer?.player_name === lobby.host_name

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/lobbies" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lobbies
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Lobby Info */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/50 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span>{lobbyData.name}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {players.length}/{lobbyData.max_players} players
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Game Type: {lobbyData.lobby_type}</span>
                  <span>Host: {lobbyData.host_name}</span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(players.length / lobbyData.max_players) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players List */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {player.player_name === lobby.host_name && <Crown className="h-4 w-4 text-yellow-500" />}
                      <span className="text-white font-medium">{player.player_name}</span>
                      {player.player_name === currentPlayer?.player_name && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">You</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {player.is_ready ? (
                        <div className="flex items-center space-x-1 text-green-400">
                          <Check className="h-4 w-4" />
                          <span className="text-sm">Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-gray-400">
                          <X className="h-4 w-4" />
                          <span className="text-sm">Not Ready</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: lobbyData.max_players - players.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center justify-center p-3 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600"
                  >
                    <span className="text-gray-500">Waiting for player...</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Panel */}
        <div className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleToggleReady}
                className={`w-full ${
                  currentPlayerInLobby?.is_ready ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {currentPlayerInLobby?.is_ready ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Not Ready
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Ready Up
                  </>
                )}
              </Button>

              {isHost && allPlayersReady && (
                <Button
                  onClick={handleStartGame}
                  disabled={isStartingDraft}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isStartingDraft
                    ? "Starting..."
                    : lobbyData.lobby_type === "4v4_draft"
                      ? "Start Draft"
                      : "Start Game"}
                </Button>
              )}

              <Button
                onClick={handleLeaveLobby}
                disabled={isLeaving}
                variant="outline"
                className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
              >
                {isLeaving ? "Leaving..." : "Leave Lobby"}
              </Button>
            </CardContent>
          </Card>

          {/* Lobby Info */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Lobby Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-400">
              <div>Created: {new Date(lobbyData.created_at).toLocaleString()}</div>
              <div>Type: {lobbyData.lobby_type}</div>
              <div>Privacy: {lobbyData.is_private ? "Private" : "Public"}</div>
              <div>Status: {lobbyData.status}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
