"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Calendar } from "lucide-react"
import { submitMatchResult } from "@/lib/tournament-actions"
import { useState } from "react"

interface TournamentBracketProps {
  matches: any[]
  tournament: any
}

export default function TournamentBracket({ matches, tournament }: TournamentBracketProps) {
  const [submittingResults, setSubmittingResults] = useState<string | null>(null)

  const handleSubmitResult = async (matchId: string, team1Score: number, team2Score: number) => {
    setSubmittingResults(matchId)
    const result = await submitMatchResult(matchId, team1Score, team2Score)

    if (result?.error) {
      alert(result.error)
    }

    setSubmittingResults(null)
  }

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round_number]) {
      acc[match.round_number] = []
    }
    acc[match.round_number].push(match)
    return acc
  }, {})

  const rounds = Object.keys(matchesByRound).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Tournament Bracket</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {rounds.map((roundNum) => (
            <div key={roundNum}>
              <h3 className="text-lg font-semibold text-white mb-4">
                Round {roundNum}
                {Number.parseInt(roundNum) === rounds.length && matches.some((m) => m.status === "completed") && (
                  <span className="ml-2 text-yellow-500">(Finals)</span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchesByRound[roundNum].map((match: any) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onSubmitResult={handleSubmitResult}
                    isSubmitting={submittingResults === match.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface MatchCardProps {
  match: any
  onSubmitResult: (matchId: string, team1Score: number, team2Score: number) => void
  isSubmitting: boolean
}

function MatchCard({ match, onSubmitResult, isSubmitting }: MatchCardProps) {
  const [team1Score, setTeam1Score] = useState(match.team1_score || 0)
  const [team2Score, setTeam2Score] = useState(match.team2_score || 0)

  const handleSubmit = () => {
    onSubmitResult(match.id, team1Score, team2Score)
  }

  return (
    <div className="p-4 bg-gray-700/50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">Match {match.match_number}</span>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${
            match.status === "completed"
              ? "bg-green-500/20 text-green-400"
              : match.status === "active"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {match.status}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div
          className={`flex items-center justify-between p-2 rounded ${
            match.winner_id === match.team1_id ? "bg-green-600/20" : "bg-gray-600/20"
          }`}
        >
          <span className="text-white font-medium">{match.team1_player?.player_name || "TBD"}</span>
          {match.status === "completed" ? (
            <span className="text-white font-bold">{match.team1_score}</span>
          ) : match.status === "active" ? (
            <Input
              type="number"
              min="0"
              value={team1Score}
              onChange={(e) => setTeam1Score(Number.parseInt(e.target.value) || 0)}
              className="w-16 h-8 bg-gray-600 border-gray-500 text-white text-center"
            />
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>

        <div
          className={`flex items-center justify-between p-2 rounded ${
            match.winner_id === match.team2_id ? "bg-green-600/20" : "bg-gray-600/20"
          }`}
        >
          <span className="text-white font-medium">{match.team2_player?.player_name || "TBD"}</span>
          {match.status === "completed" ? (
            <span className="text-white font-bold">{match.team2_score}</span>
          ) : match.status === "active" ? (
            <Input
              type="number"
              min="0"
              value={team2Score}
              onChange={(e) => setTeam2Score(Number.parseInt(e.target.value) || 0)}
              className="w-16 h-8 bg-gray-600 border-gray-500 text-white text-center"
            />
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </div>

      {match.scheduled_at && (
        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
          <Calendar className="h-3 w-3" />
          <span>{new Date(match.scheduled_at).toLocaleString()}</span>
        </div>
      )}

      {match.status === "active" && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Submitting..." : "Submit Result"}
        </Button>
      )}
    </div>
  )
}
