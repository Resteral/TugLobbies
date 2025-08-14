"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  Users,
  Target,
  Clock,
  Flag,
  Award,
  ArrowLeft,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { submitScore, flagPlayer, awardMerit } from "@/lib/scoring-actions"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface GameScoringProps {
  gameSession: any
  scoreSubmissions: any[]
  currentPlayer: any
  allPlayers: any[]
}

export default function GameScoring({
  gameSession,
  scoreSubmissions: initialSubmissions,
  currentPlayer,
  allPlayers,
}: GameScoringProps) {
  const [scoreSubmissions, setScoreSubmissions] = useState(initialSubmissions)
  const [team1Score, setTeam1Score] = useState(gameSession.team1_score || 0)
  const [team2Score, setTeam2Score] = useState(gameSession.team2_score || 0)
  const [mvpVote, setMvpVote] = useState("")
  const [flaggedPlayer, setFlaggedPlayer] = useState("")
  const [flagReason, setFlagReason] = useState("")
  const [meritPlayer, setMeritPlayer] = useState("")
  const [meritReason, setMeritReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gameData, setGameData] = useState(gameSession)

  const supabase = createClient()

  // Set up real-time subscriptions
  useEffect(() => {
    const gameSubscription = supabase
      .channel(`game_${gameSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "score_submissions",
          filter: `lobby_id=eq.${gameSession.lobby_id}`,
        },
        (payload) => {
          // Refresh score submissions
          supabase
            .from("score_submissions")
            .select("*")
            .eq("lobby_id", gameSession.lobby_id)
            .order("created_at", { ascending: false })
            .then(({ data }) => {
              if (data) setScoreSubmissions(data)
            })
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${gameSession.id}`,
        },
        (payload) => {
          if (payload.new) {
            setGameData(payload.new)
            setTeam1Score(payload.new.team1_score || 0)
            setTeam2Score(payload.new.team2_score || 0)
          }
        },
      )
      .subscribe()

    return () => {
      gameSubscription.unsubscribe()
    }
  }, [gameSession.id, gameSession.lobby_id, supabase])

  const handleSubmitScore = async () => {
    setIsSubmitting(true)
    const result = await submitScore(
      gameSession.id,
      team1Score,
      team2Score,
      mvpVote,
      flaggedPlayer ? [flaggedPlayer] : [],
      flaggedPlayer && flagReason ? { [flaggedPlayer]: flagReason } : {},
    )

    if (result?.error) {
      alert(result.error)
    } else {
      // Reset form
      setMvpVote("")
      setFlaggedPlayer("")
      setFlagReason("")
    }

    setIsSubmitting(false)
  }

  const handleFlagPlayer = async () => {
    if (!flaggedPlayer || !flagReason) return

    const result = await flagPlayer(gameSession.id, flaggedPlayer, flagReason)
    if (result?.error) {
      alert(result.error)
    } else {
      setFlaggedPlayer("")
      setFlagReason("")
    }
  }

  const handleAwardMerit = async () => {
    if (!meritPlayer || !meritReason) return

    const result = await awardMerit(gameSession.id, meritPlayer, meritReason)
    if (result?.error) {
      alert(result.error)
    } else {
      setMeritPlayer("")
      setMeritReason("")
    }
  }

  // Get recent submissions for consensus display
  const recentSubmissions = scoreSubmissions.slice(0, 5)
  const consensusScore = getConsensusScore(scoreSubmissions)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Game Header */}
      <Card className="bg-gray-800/50 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>Live Game Scoring</span>
            </div>
            <div
              className={`px-3 py-1 rounded text-sm font-medium ${
                gameData.status === "active" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {gameData.status === "active" ? "Live" : "Completed"}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team 1 */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Team 1</h3>
              <div className="text-4xl font-bold text-white mb-2">{gameData.team1_score || 0}</div>
              <div className="space-y-1">
                {gameData.team1?.map((player: string) => (
                  <div key={player} className="text-sm text-gray-300">
                    {player}
                  </div>
                ))}
              </div>
            </div>

            {/* VS */}
            <div className="flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-400">VS</div>
            </div>

            {/* Team 2 */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Team 2</h3>
              <div className="text-4xl font-bold text-white mb-2">{gameData.team2_score || 0}</div>
              <div className="space-y-1">
                {gameData.team2?.map((player: string) => (
                  <div key={player} className="text-sm text-gray-300">
                    {player}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scoring Interface */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="score" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
              <TabsTrigger value="score" className="data-[state=active]:bg-blue-600">
                Score
              </TabsTrigger>
              <TabsTrigger value="flag" className="data-[state=active]:bg-red-600">
                Flag
              </TabsTrigger>
              <TabsTrigger value="merit" className="data-[state=active]:bg-green-600">
                Merit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="score">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Submit Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score Input */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Team 1 Score</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setTeam1Score(Math.max(0, team1Score - 1))}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={team1Score}
                          onChange={(e) => setTeam1Score(Number.parseInt(e.target.value) || 0)}
                          className="bg-gray-700 border-gray-600 text-white text-center text-2xl font-bold"
                        />
                        <Button
                          onClick={() => setTeam1Score(team1Score + 1)}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Team 2 Score</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setTeam2Score(Math.max(0, team2Score - 1))}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={team2Score}
                          onChange={(e) => setTeam2Score(Number.parseInt(e.target.value) || 0)}
                          className="bg-gray-700 border-gray-600 text-white text-center text-2xl font-bold"
                        />
                        <Button
                          onClick={() => setTeam2Score(team2Score + 1)}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* MVP Vote */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">MVP Vote (Optional)</Label>
                    <Select value={mvpVote} onValueChange={setMvpVote}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select MVP" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {[...gameData.team1, ...gameData.team2].map((player: string) => (
                          <SelectItem key={player} value={player}>
                            {player}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSubmitScore}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Score"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flag">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Flag className="h-5 w-5 text-red-500" />
                    <span>Flag Player</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Player</Label>
                    <Select value={flaggedPlayer} onValueChange={setFlaggedPlayer}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select player to flag" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {[...gameData.team1, ...gameData.team2].map((player: string) => (
                          <SelectItem key={player} value={player}>
                            {player}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Reason</Label>
                    <Textarea
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      placeholder="Describe the misconduct..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleFlagPlayer}
                    disabled={!flaggedPlayer || !flagReason}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Flag Player
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="merit">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Award className="h-5 w-5 text-green-500" />
                    <span>Award Merit</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Player</Label>
                    <Select value={meritPlayer} onValueChange={setMeritPlayer}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select player for merit" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {[...gameData.team1, ...gameData.team2].map((player: string) => (
                          <SelectItem key={player} value={player}>
                            {player}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Reason</Label>
                    <Textarea
                      value={meritReason}
                      onChange={(e) => setMeritReason(e.target.value)}
                      placeholder="Describe the good sportsmanship..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleAwardMerit}
                    disabled={!meritPlayer || !meritReason}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Award Merit
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Submissions */}
        <div className="space-y-6">
          {/* Consensus Score */}
          {consensusScore && (
            <Card className="bg-green-800/30 border-green-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Consensus Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {consensusScore.team1} - {consensusScore.team2}
                  </div>
                  <div className="text-sm text-green-400 mt-1">{consensusScore.count} submissions agree</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Submissions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <span>Recent Submissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions yet</p>
                  <p className="text-sm">Be the first to score!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSubmissions.map((submission) => (
                    <div key={submission.id} className="p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{submission.player_name}</span>
                        <span className="text-sm text-gray-400">
                          {new Date(submission.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-white">
                          {submission.team1_score} - {submission.team2_score}
                        </div>
                        {submission.mvp_vote && (
                          <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
                            MVP: {submission.mvp_vote}
                          </Badge>
                        )}
                      </div>
                      {submission.flagged_players?.length > 0 && (
                        <div className="mt-2 flex items-center space-x-1 text-red-400">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs">Flagged players</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Scorers */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span>Active Scorers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{scoreSubmissions.length}</div>
                <div className="text-sm text-gray-400">Total submissions</div>
              </div>
              <div className="mt-4 text-xs text-gray-500">Multiple people can score simultaneously for accuracy</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getConsensusScore(submissions: any[]) {
  if (submissions.length < 2) return null

  const scoreMap = new Map()
  submissions.forEach((sub) => {
    const key = `${sub.team1_score}-${sub.team2_score}`
    scoreMap.set(key, (scoreMap.get(key) || 0) + 1)
  })

  const consensusEntry = Array.from(scoreMap.entries()).reduce((a, b) => (a[1] > b[1] ? a : b))

  if (consensusEntry[1] >= 2) {
    const [team1, team2] = consensusEntry[0].split("-").map(Number)
    return { team1, team2, count: consensusEntry[1] }
  }

  return null
}
