"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Clock, CheckCircle } from "lucide-react"
import { useState } from "react"
import GameResultForm from "./game-result-form"

interface Game {
  id: string
  team1_id: string
  team2_id: string
  team1_score: number
  team2_score: number
  status: string
  scheduled_at?: string
  team1?: { id: string; name: string; players?: { display_name: string } }
  team2?: { id: string; name: string; players?: { display_name: string } }
}

interface Team {
  id: string
  name: string
  players?: { display_name: string }
}

interface Props {
  games: Game[]
  teams: Team[]
}

export default function TournamentBracket({ games, teams }: Props) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  // Organize games by rounds
  const organizeGamesByRounds = (games: Game[]) => {
    const rounds: Game[][] = []
    const sortedGames = [...games].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    let currentRound: Game[] = []
    let expectedGamesInRound = Math.ceil(teams.length / 2)

    sortedGames.forEach((game, index) => {
      currentRound.push(game)

      if (currentRound.length === expectedGamesInRound) {
        rounds.push([...currentRound])
        currentRound = []
        expectedGamesInRound = Math.ceil(expectedGamesInRound / 2)
      }
    })

    if (currentRound.length > 0) {
      rounds.push(currentRound)
    }

    return rounds
  }

  const rounds = organizeGamesByRounds(games)

  const getGameStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "live":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getGameStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "live":
        return <Trophy className="h-4 w-4" />
      case "scheduled":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getRoundName = (roundIndex: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - roundIndex
    switch (roundsFromEnd) {
      case 1:
        return "Final"
      case 2:
        return "Semifinal"
      case 3:
        return "Quarterfinal"
      default:
        return `Round ${roundIndex + 1}`
    }
  }

  return (
    <div className="space-y-8">
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="space-y-4">
          <h3 className="text-xl font-bold text-white text-center">{getRoundName(roundIndex, rounds.length)}</h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {round.map((game) => (
              <Card key={game.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-slate-400">
                      {game.scheduled_at
                        ? new Date(game.scheduled_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "Not Scheduled"}
                    </CardTitle>
                    <Badge className={getGameStatusColor(game.status)}>
                      <div className="flex items-center space-x-1">
                        {getGameStatusIcon(game.status)}
                        <span className="capitalize">{game.status}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">
                        {game.team1?.players?.display_name || game.team1?.name || "TBD"}
                      </div>
                    </div>
                    {game.status === "completed" && (
                      <div
                        className={`text-lg font-bold ${
                          game.team1_score > game.team2_score ? "text-green-400" : "text-slate-400"
                        }`}
                      >
                        {game.team1_score}
                      </div>
                    )}
                  </div>

                  {/* VS Divider */}
                  <div className="text-center text-slate-500 text-sm font-semibold">VS</div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">
                        {game.team2?.players?.display_name || game.team2?.name || "TBD"}
                      </div>
                    </div>
                    {game.status === "completed" && (
                      <div
                        className={`text-lg font-bold ${
                          game.team2_score > game.team1_score ? "text-green-400" : "text-slate-400"
                        }`}
                      >
                        {game.team2_score}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    {game.status === "scheduled" && (
                      <Button
                        onClick={() => setSelectedGame(game)}
                        size="sm"
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        Record Result
                      </Button>
                    )}
                    {game.status === "live" && (
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        View Live
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Game Result Form Modal */}
      {selectedGame && <GameResultForm game={selectedGame} onClose={() => setSelectedGame(null)} />}
    </div>
  )
}
