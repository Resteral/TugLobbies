"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users, DollarSign, Calendar, Crown, ArrowLeft, Play } from "lucide-react"
import Link from "next/link"
import { registerForTournament, startTournament } from "@/lib/tournament-actions"
import { useState } from "react"
import TournamentBracket from "@/components/tournament-bracket"

interface TournamentViewProps {
  tournament: any
  participants: any[]
  matches: any[]
  currentUserId: string
  isRegistered: boolean
}

export default function TournamentView({
  tournament,
  participants,
  matches,
  currentUserId,
  isRegistered: initialIsRegistered,
}: TournamentViewProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered)

  const handleRegister = async () => {
    setIsRegistering(true)
    const result = await registerForTournament(tournament.id, "player")

    if (result?.error) {
      alert(result.error)
    } else {
      setIsRegistered(true)
    }

    setIsRegistering(false)
  }

  const handleStartTournament = async () => {
    setIsStarting(true)
    const result = await startTournament(tournament.id)

    if (result?.error) {
      alert(result.error)
    }

    setIsStarting(false)
  }

  const isCreator = tournament.created_by === currentUserId
  const canStart = isCreator && tournament.status === "registration" && participants.length >= 4

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/tournaments"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Link>
      </div>

      {/* Tournament Header */}
      <Card className="bg-gray-800/50 border-gray-700 mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white flex items-center space-x-2 text-2xl mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span>{tournament.name}</span>
              </CardTitle>
              <div className="flex items-center space-x-4 text-gray-400">
                <span className="flex items-center space-x-1">
                  <Crown className="h-4 w-4" />
                  <span>{tournament.type}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {participants.length}/{tournament.max_teams} teams
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(tournament.created_at).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              {tournament.prize_pool > 0 && (
                <div className="flex items-center space-x-2 text-green-400 mb-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-xl font-bold">${tournament.prize_pool}</span>
                </div>
              )}
              {tournament.entry_fee > 0 && (
                <div className="text-sm text-gray-400">Entry Fee: ${tournament.entry_fee}</div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div
              className={`px-3 py-1 rounded text-sm font-medium ${
                tournament.status === "registration"
                  ? "bg-green-500/20 text-green-400"
                  : tournament.status === "active"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {tournament.status === "registration"
                ? "Registration Open"
                : tournament.status === "active"
                  ? "In Progress"
                  : "Completed"}
            </div>

            <div className="flex items-center space-x-3">
              {tournament.status === "registration" && !isRegistered && (
                <Button
                  onClick={handleRegister}
                  disabled={isRegistering || participants.length >= tournament.max_teams}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isRegistering ? "Registering..." : "Register"}
                </Button>
              )}

              {canStart && (
                <Button
                  onClick={handleStartTournament}
                  disabled={isStarting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isStarting ? "Starting..." : "Start Tournament"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Participants */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No participants yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {participant.seed_number}
                      </div>
                      <span className="text-white font-medium">{participant.player_stats?.player_name}</span>
                      {participant.participant_id === currentUserId && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">You</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">ELO: {participant.player_stats?.elo || 1000}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tournament Bracket */}
        <div className="lg:col-span-2">
          {matches.length > 0 ? (
            <TournamentBracket matches={matches} tournament={tournament} />
          ) : (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Tournament Bracket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-gray-400">
                  <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Tournament bracket will appear here once started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
