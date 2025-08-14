"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Users, Target, Clock, Trophy } from "lucide-react"
import { draftPlayer, startGameFromDraft } from "@/lib/draft-actions"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DraftInterfaceProps {
  draftState: any
  lobby: any
  currentPlayer: any
  playerStats: any[]
}

export default function DraftInterface({
  draftState: initialDraftState,
  lobby,
  currentPlayer,
  playerStats,
}: DraftInterfaceProps) {
  const [draftState, setDraftState] = useState(initialDraftState)
  const [isDrafting, setIsDrafting] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel(`draft_${lobby.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "draft_state",
          filter: `lobby_id=eq.${lobby.id}`,
        },
        (payload) => {
          if (payload.new) {
            setDraftState(payload.new)
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [lobby.id, supabase])

  const handleDraftPlayer = async (playerName: string) => {
    setIsDrafting(true)
    const result = await draftPlayer(lobby.id, playerName)

    if (result?.error) {
      alert(result.error)
    }

    setIsDrafting(false)
  }

  const handleStartGame = async () => {
    setIsStartingGame(true)
    const result = await startGameFromDraft(lobby.id)

    if (result?.error) {
      alert(result.error)
      setIsStartingGame(false)
    } else if (result?.gameId) {
      router.push(`/game/${result.gameId}`)
    }
  }

  const getPlayerElo = (playerName: string) => {
    const player = playerStats.find((p) => p.player_name === playerName)
    return player?.elo || 1000
  }

  const isCurrentPlayerTurn = currentPlayer?.player_name === draftState.current_picker
  const isCaptain =
    currentPlayer?.player_name === draftState.captain1 || currentPlayer?.player_name === draftState.captain2

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Draft Phase</h1>
        <p className="text-gray-400">{lobby.name}</p>
        {!draftState.is_complete && (
          <div className="mt-4 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
            <p className="text-blue-400 font-medium">
              {isCurrentPlayerTurn ? "Your turn to pick!" : `Waiting for ${draftState.current_picker} to pick...`}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team 1 */}
        <Card className="bg-red-800/30 border-red-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>Team 1 - {draftState.captain1}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {draftState.team1.map((playerName: string, index: number) => (
                <div key={playerName} className="flex items-center justify-between p-3 bg-red-700/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                    <span className="text-white font-medium">{playerName}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Target className="h-3 w-3" />
                    <span className="text-sm">{getPlayerElo(playerName)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Players */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span>Available Players</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {draftState.is_complete ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold text-white mb-2">Draft Complete!</h3>
                <p className="text-gray-400 mb-6">Teams are ready to play</p>
                {isCaptain && (
                  <Button
                    onClick={handleStartGame}
                    disabled={isStartingGame}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isStartingGame ? "Starting Game..." : "Start Game"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {draftState.available_players.map((playerName: string) => (
                  <div key={playerName} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{playerName}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-gray-300">
                        <Target className="h-3 w-3" />
                        <span className="text-sm">{getPlayerElo(playerName)}</span>
                      </div>
                      <Button
                        onClick={() => handleDraftPlayer(playerName)}
                        disabled={!isCurrentPlayerTurn || isDrafting}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isDrafting ? "Picking..." : "Pick"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team 2 */}
        <Card className="bg-blue-800/30 border-blue-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>Team 2 - {draftState.captain2}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {draftState.team2.map((playerName: string, index: number) => (
                <div key={playerName} className="flex items-center justify-between p-3 bg-blue-700/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                    <span className="text-white font-medium">{playerName}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Target className="h-3 w-3" />
                    <span className="text-sm">{getPlayerElo(playerName)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Draft Progress */}
      <Card className="bg-gray-800/50 border-gray-700 mt-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <span>Draft Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Pick {draftState.pick_number}</span>
            <span>
              {draftState.team1.length + draftState.team2.length} /{" "}
              {draftState.team1.length + draftState.team2.length + draftState.available_players.length} players drafted
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{
                width: `${
                  ((draftState.team1.length + draftState.team2.length) /
                    (draftState.team1.length + draftState.team2.length + draftState.available_players.length)) *
                  100
                }%`,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
