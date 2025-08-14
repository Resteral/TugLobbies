"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  Award,
  Flag,
  ArrowLeft,
  Edit,
  BarChart3,
  Clock,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { updatePlayerProfile } from "@/lib/profile-actions"
import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { VerificationBadge } from "@/components/verification-badge" // Added verification badge import

interface PlayerProfileProps {
  playerData: any
  gameHistory: any[]
  detailedStats: any[]
  merits: any[]
  flags: any[]
  isOwnProfile: boolean
}

function UpdateButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700">
      {pending ? "Updating..." : "Update Profile"}
    </Button>
  )
}

export default function PlayerProfile({
  playerData,
  gameHistory,
  detailedStats,
  merits,
  flags,
  isOwnProfile,
}: PlayerProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction] = useActionState(updatePlayerProfile, null)

  const calculateAverageStats = () => {
    if (detailedStats.length === 0) return null

    const totals = detailedStats.reduce(
      (acc, stat) => ({
        goals: acc.goals + (stat.goals || 0),
        assists: acc.assists + (stat.assists || 0),
        shots: acc.shots + (stat.shots || 0),
        saves: acc.saves + (stat.save_amount || 0),
        passes: acc.passes + (stat.passes || 0),
      }),
      { goals: 0, assists: 0, shots: 0, saves: 0, passes: 0 },
    )

    return {
      goals: (totals.goals / detailedStats.length).toFixed(1),
      assists: (totals.assists / detailedStats.length).toFixed(1),
      shots: (totals.shots / detailedStats.length).toFixed(1),
      saves: (totals.saves / detailedStats.length).toFixed(1),
      passes: (totals.passes / detailedStats.length).toFixed(1),
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case "legend":
        return "text-purple-400"
      case "master":
        return "text-red-400"
      case "expert":
        return "text-orange-400"
      case "advanced":
        return "text-yellow-400"
      case "intermediate":
        return "text-green-400"
      case "beginner":
        return "text-blue-400"
      default:
        return "text-gray-400"
    }
  }

  const averageStats = calculateAverageStats()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Profile Header */}
      <Card className="bg-gray-800/50 border-gray-700 mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                {isEditing && isOwnProfile ? (
                  <form action={formAction} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        name="playerName"
                        defaultValue={playerData?.player_name}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <UpdateButton />
                      <Button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                      >
                        Cancel
                      </Button>
                    </div>
                    {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
                    {state?.success && <p className="text-green-400 text-sm">{state.success}</p>}
                  </form>
                ) : (
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-white">{playerData?.player_name}</h1>
                    <VerificationBadge verified={playerData?.verified || false} size="lg" />
                    {isOwnProfile && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={`${getRankColor(playerData?.rank)} bg-transparent border-current`}>
                    {playerData?.rank || "Rookie"}
                  </Badge>
                  <span className="text-gray-400">
                    Member since {new Date(playerData?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{playerData?.elo || 1000}</div>
              <div className="text-sm text-gray-400">ELO Rating</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{playerData?.wins || 0}</div>
              <div className="text-sm text-gray-400">Wins</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">{playerData?.losses || 0}</div>
              <div className="text-sm text-gray-400">Losses</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{Math.round((playerData?.win_rate || 0) * 100)}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="stats" className="data-[state=active]:bg-blue-600">
            Statistics
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-green-600">
            Game History
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-yellow-600">
            Achievements
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Stats */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <span>Overall Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Games</span>
                    <span className="text-white font-semibold">{playerData?.total_games || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Win Streak</span>
                    <span className="text-white font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Game</span>
                    <span className="text-white font-semibold">
                      {playerData?.last_game_at ? new Date(playerData.last_game_at).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">ELO Change (Last 10)</span>
                    <span className="text-green-400 font-semibold">+25</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Performance */}
            {averageStats && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span>Average Per Game</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Goals</span>
                      <span className="text-white font-semibold">{averageStats.goals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Assists</span>
                      <span className="text-white font-semibold">{averageStats.assists}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Shots</span>
                      <span className="text-white font-semibold">{averageStats.shots}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Saves</span>
                      <span className="text-white font-semibold">{averageStats.saves}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Passes</span>
                      <span className="text-white font-semibold">{averageStats.passes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-400" />
                <span>Recent Games</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gameHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No games played yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gameHistory.map((game) => {
                    const playerTeam = game.team1?.includes(playerData?.player_name) ? 1 : 2
                    const playerScore = playerTeam === 1 ? game.team1_score : game.team2_score
                    const opponentScore = playerTeam === 1 ? game.team2_score : game.team1_score
                    const won = playerScore > opponentScore

                    return (
                      <div key={game.id} className="p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${won ? "bg-green-500" : "bg-red-500"}`} />
                            <div>
                              <div className="text-white font-medium">
                                {won ? "Victory" : "Defeat"} - {playerScore}:{opponentScore}
                              </div>
                              <div className="text-sm text-gray-400">
                                {new Date(game.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={won ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"}
                          >
                            {won ? "+ELO" : "-ELO"}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Merits */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-400" />
                  <span>Merits ({merits.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {merits.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No merits yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {merits.slice(0, 5).map((merit) => (
                      <div key={merit.id} className="p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
                        <div className="text-green-400 font-medium">{merit.reason}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Awarded by {merit.merited_by?.join(", ")} on {new Date(merit.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flags */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Flag className="h-5 w-5 text-red-400" />
                  <span>Flags ({flags.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flags.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Clean record</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {flags.slice(0, 5).map((flag) => (
                      <div key={flag.id} className="p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
                        <div className="text-red-400 font-medium">{flag.reason}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Flagged by {flag.flagged_by?.join(", ")} on {new Date(flag.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                <span>Detailed Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detailedStats.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No detailed stats available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {detailedStats.slice(0, 10).map((stat) => (
                    <div key={stat.id} className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{new Date(stat.game_date).toLocaleDateString()}</span>
                        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                          Team {stat.team}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-white font-semibold">{stat.goals || 0}</div>
                          <div className="text-gray-400">Goals</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{stat.assists || 0}</div>
                          <div className="text-gray-400">Assists</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{stat.shots || 0}</div>
                          <div className="text-gray-400">Shots</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{stat.save_amount || 0}</div>
                          <div className="text-gray-400">Saves</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{stat.passes || 0}</div>
                          <div className="text-gray-400">Passes</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
