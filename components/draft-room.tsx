"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Clock, Search } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface DraftRoomProps {
  tournament: any
  teams: any[]
  availablePlayers: any[]
  currentPlayer: any
  userTeam: any
  draftEvents: any[]
}

export default function DraftRoom({
  tournament,
  teams,
  availablePlayers,
  currentPlayer,
  userTeam,
  draftEvents,
}: DraftRoomProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPick, setCurrentPick] = useState(1)
  const [currentRound, setCurrentRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes per pick
  const [draftedPlayers, setDraftedPlayers] = useState<string[]>([])

  // Calculate current turn based on snake draft
  const totalTeams = teams.length
  const isReverseRound = currentRound % 2 === 0
  const teamIndex = isReverseRound ? totalTeams - ((currentPick - 1) % totalTeams) - 1 : (currentPick - 1) % totalTeams
  const currentTeam = teams[teamIndex]
  const isUserTurn = userTeam && currentTeam?.id === userTeam.id

  // Filter available players
  const filteredPlayers = availablePlayers.filter(
    (player) =>
      !draftedPlayers.includes(player.id) &&
      (player.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.position.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [currentPick])

  // Real-time updates for draft events
  useEffect(() => {
    const channel = supabase
      .channel(`draft-${tournament.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "draft_events",
          filter: `tournament_id=eq.${tournament.id}`,
        },
        (payload) => {
          // Update drafted players and advance pick
          setDraftedPlayers((prev) => [...prev, payload.new.player_id])
          setCurrentPick((prev) => prev + 1)

          // Check if we need to advance round
          if (currentPick % totalTeams === 0) {
            setCurrentRound((prev) => prev + 1)
          }

          // Reset timer
          setTimeLeft(120)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournament.id, currentPick, totalTeams])

  const handleDraftPick = async (playerId: string) => {
    if (!isUserTurn || !userTeam) return

    const formData = new FormData()
    formData.append("tournamentId", tournament.id)
    formData.append("playerId", playerId)
    formData.append("teamId", userTeam.id)
    formData.append("pickNumber", currentPick.toString())
    formData.append("roundNumber", currentRound.toString())

    // This would typically be handled by a server action
    // For now, we'll simulate the pick
    console.log("Making draft pick:", { playerId, teamId: userTeam.id, pick: currentPick, round: currentRound })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Forward":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Defense":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Goalie":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Draft Status */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Live Draft - Round {currentRound}</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-orange-500">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Pick #{currentPick}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-slate-400 text-sm">Current Pick</div>
              <div className="text-white text-xl font-bold">
                {currentTeam?.name} ({currentTeam?.players?.display_name})
              </div>
              {isUserTurn && <div className="text-orange-500 font-semibold mt-2">It's your turn to pick!</div>}
            </div>

            {/* Draft Order Visualization */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {teams.map((team, index) => {
                const isCurrentTurn = index === teamIndex
                return (
                  <div
                    key={team.id}
                    className={`p-2 rounded text-center text-xs ${
                      isCurrentTurn
                        ? "bg-orange-500/20 border border-orange-500/50"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                  >
                    <div className="text-white font-semibold truncate">{team.players?.display_name}</div>
                    <div className="text-slate-400">{team.players?.elo_rating}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Selection */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Players */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Available Players</span>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="text-white font-semibold">{player.display_name}</div>
                        <div className="text-slate-400 text-sm">@{player.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getPositionColor(player.position)}>{player.position}</Badge>
                      <div className="text-right">
                        <div className="text-orange-500 font-bold">{player.elo_rating}</div>
                        <div className="text-slate-400 text-xs">ELO</div>
                      </div>
                      {isUserTurn && (
                        <Button
                          onClick={() => handleDraftPick(player.id)}
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Draft
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Draft History */}
        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Picks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {draftEvents
                  .sort((a, b) => b.pick_number - a.pick_number)
                  .slice(0, 10)
                  .map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                      <div>
                        <div className="text-white text-sm font-semibold">{event.players?.display_name}</div>
                        <div className="text-slate-400 text-xs">to {event.teams?.players?.display_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-orange-500 text-xs font-bold">#{event.pick_number}</div>
                        <div className="text-slate-400 text-xs">R{event.round_number}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
