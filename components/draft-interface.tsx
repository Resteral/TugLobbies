"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Crown, Clock, Users, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { startMatch, makeDraftPick, passDraftTurn } from "@/lib/actions"

interface DraftInterfaceProps {
  lobbyId: string
  currentPlayer: any
  lobbyPlayers: any[]
  lobbyType: string
}

export default function DraftInterface({ lobbyId, currentPlayer, lobbyPlayers, lobbyType }: DraftInterfaceProps) {
  const [draftState, setDraftState] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Sort players by ELO to determine captains
  const sortedPlayers = [...lobbyPlayers].sort((a, b) => (b.players?.elo_rating || 0) - (a.players?.elo_rating || 0))

  const captain1 = sortedPlayers[0]
  const captain2 = sortedPlayers[1]
  const availablePlayers = sortedPlayers.slice(2)

  useEffect(() => {
    // Initialize draft state
    const initDraft = async () => {
      const { data } = await supabase.from("draft_state").select("*").eq("lobby_id", lobbyId).single()

      if (!data) {
        // Create initial draft state
        const newDraftState = {
          lobby_id: lobbyId,
          captain1_id: captain1?.player_name,
          captain2_id: captain2?.player_name,
          current_picker: captain1?.player_name,
          pick_number: 1,
          team1_players: [captain1?.player_name],
          team2_players: [captain2?.player_name],
          available_players: availablePlayers.map((p) => p.player_name),
          draft_complete: false,
        }

        await supabase.from("draft_state").insert(newDraftState)
        setDraftState(newDraftState)
      } else {
        setDraftState(data)
      }
    }

    initDraft()

    // Set up real-time subscription
    const channel = supabase
      .channel(`draft-${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "draft_state",
          filter: `lobby_id=eq.${lobbyId}`,
        },
        (payload) => {
          setDraftState(payload.new)
          setTimeLeft(30) // Reset timer on each pick
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lobbyId])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && draftState && !draftState.draft_complete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && draftState?.current_picker === currentPlayer.name) {
      // Auto-pass when timer runs out
      handlePass()
    }
  }, [timeLeft, draftState, currentPlayer.name])

  const handlePick = async (playerName: string) => {
    if (isLoading || draftState?.current_picker !== currentPlayer.name) return

    setIsLoading(true)
    await makeDraftPick(lobbyId, playerName, currentPlayer.name)
    setIsLoading(false)
  }

  const handlePass = async () => {
    if (isLoading || draftState?.current_picker !== currentPlayer.name) return

    setIsLoading(true)
    await passDraftTurn(lobbyId, currentPlayer.name)
    setIsLoading(false)
  }

  const handleStartMatch = async () => {
    setIsLoading(true)
    await startMatch(lobbyId)
    setIsLoading(false)
  }

  if (!draftState) {
    return <div className="flex items-center justify-center min-h-screen">Loading draft...</div>
  }

  if (draftState.draft_complete) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Draft Complete!</h1>
          <p className="text-gray-400">Teams are ready for battle</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Team 1 */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-semibold">Team 1</h2>
            </div>
            <div className="space-y-3">
              {draftState.team1_players?.map((playerName: string, index: number) => {
                const player = lobbyPlayers.find((p) => p.player_name === playerName)
                return (
                  <div key={playerName} className="flex items-center space-x-3 p-3 bg-gray-800 rounded">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{playerName}</div>
                      <div className="text-sm text-gray-400">ELO: {player?.players?.elo_rating || 1000}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-semibold">Team 2</h2>
            </div>
            <div className="space-y-3">
              {draftState.team2_players?.map((playerName: string, index: number) => {
                const player = lobbyPlayers.find((p) => p.player_name === playerName)
                return (
                  <div key={playerName} className="flex items-center space-x-3 p-3 bg-gray-800 rounded">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                      {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{playerName}</div>
                      <div className="text-sm text-gray-400">ELO: {player?.players?.elo_rating || 1000}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={handleStartMatch} size="lg" disabled={isLoading}>
            <Trophy className="h-5 w-5 mr-2" />
            Start Match
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Draft Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Draft Phase</h1>
        <div className="flex items-center justify-center space-x-4 text-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>{timeLeft}s</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Pick {draftState.pick_number}</span>
          </div>
        </div>
        <p className="text-gray-400 mt-2">
          {draftState.current_picker === currentPlayer.name
            ? "Your turn to pick!"
            : `${draftState.current_picker} is picking...`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Players */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Available Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftState.available_players?.map((playerName: string) => {
              const player = lobbyPlayers.find((p) => p.player_name === playerName)
              return (
                <div key={playerName} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-full overflow-hidden">
                      {player?.players?.profile_picture ? (
                        <img
                          src={player.players.profile_picture || "/placeholder.svg"}
                          alt={playerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-semibold">
                          {playerName[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{playerName}</div>
                      <div className="text-sm text-gray-400">ELO: {player?.players?.elo_rating || 1000}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePick(playerName)}
                    disabled={draftState.current_picker !== currentPlayer.name || isLoading}
                    className="w-full"
                    size="sm"
                  >
                    Pick Player
                  </Button>
                </div>
              )
            })}
          </div>

          {draftState.current_picker === currentPlayer.name && (
            <div className="mt-6 text-center">
              <Button onClick={handlePass} disabled={isLoading} variant="outline" size="lg">
                Pass Turn
              </Button>
              <p className="text-sm text-gray-400 mt-2">Skip your pick this round</p>
            </div>
          )}
        </div>

        {/* Current Teams */}
        <div className="space-y-6">
          {/* Team 1 */}
          <div
            className={`bg-gray-800 rounded-lg p-4 ${draftState.current_picker === captain1?.player_name ? "ring-2 ring-blue-500" : ""}`}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Crown className="h-4 w-4 text-yellow-400" />
              <h3 className="font-semibold">Team 1</h3>
            </div>
            <div className="space-y-2">
              {draftState.team1_players?.map((playerName: string) => (
                <div key={playerName} className="text-sm p-2 bg-gray-700 rounded">
                  {playerName}
                </div>
              ))}
            </div>
          </div>

          {/* Team 2 */}
          <div
            className={`bg-gray-800 rounded-lg p-4 ${draftState.current_picker === captain2?.player_name ? "ring-2 ring-red-500" : ""}`}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Crown className="h-4 w-4 text-yellow-400" />
              <h3 className="font-semibold">Team 2</h3>
            </div>
            <div className="space-y-2">
              {draftState.team2_players?.map((playerName: string) => (
                <div key={playerName} className="text-sm p-2 bg-gray-700 rounded">
                  {playerName}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
