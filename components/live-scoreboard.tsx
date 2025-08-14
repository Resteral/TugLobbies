"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScoringEventForm } from "./scoring-event-form"
import { GameManagement } from "./game-management"
import { startGame, endGame, updateGameScore } from "@/lib/actions"

interface Game {
  id: string
  status: string
  team1_score: number
  team2_score: number
  start_time: string | null
  end_time: string | null
  team1: { id: string; name: string } | null
  team2: { id: string; name: string } | null
  tournament: { id: string; name: string } | null
}

interface ScoringEvent {
  id: string
  event_type: string
  period: number
  time_in_period: string
  description: string | null
  timestamp: string
  player: { id: string; name: string } | null
  team: { id: string; name: string } | null
  scorer: { id: string; name: string } | null
}

export function LiveScoreboard({ game: initialGame }: { game: Game }) {
  const [game, setGame] = useState<Game>(initialGame)
  const [events, setEvents] = useState<ScoringEvent[]>([])
  const [activeScorers, setActiveScorers] = useState<string[]>([])
  const [showScoringForm, setShowScoringForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial scoring events
    fetchScoringEvents()
    fetchActiveScorers()

    // Subscribe to real-time updates
    const gameChannel = supabase
      .channel(`game-${game.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${game.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setGame((prev) => ({ ...prev, ...payload.new }))
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scoring_events",
          filter: `game_id=eq.${game.id}`,
        },
        () => {
          fetchScoringEvents()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_scorers",
          filter: `game_id=eq.${game.id}`,
        },
        () => {
          fetchActiveScorers()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(gameChannel)
    }
  }, [game.id])

  const fetchScoringEvents = async () => {
    const { data } = await supabase
      .from("scoring_events")
      .select(`
        *,
        player:players(*),
        team:teams(*),
        scorer:profiles(*)
      `)
      .eq("game_id", game.id)
      .order("timestamp", { ascending: false })

    if (data) {
      setEvents(data)
    }
  }

  const fetchActiveScorers = async () => {
    const { data } = await supabase.from("game_scorers").select("user_id, profiles(name)").eq("game_id", game.id)

    if (data) {
      setActiveScorers(data.map((s) => s.profiles?.name || "Unknown"))
    }
  }

  const handleStartGame = async () => {
    await startGame(game.id)
  }

  const handleEndGame = async () => {
    await endGame(game.id)
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "goal":
        return "🥅"
      case "assist":
        return "🏒"
      case "penalty":
        return "⚠️"
      case "save":
        return "🛡️"
      case "shot":
        return "🎯"
      case "hit":
        return "💥"
      case "block":
        return "🚫"
      default:
        return "📝"
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "goal":
        return "bg-green-100 text-green-800"
      case "assist":
        return "bg-blue-100 text-blue-800"
      case "penalty":
        return "bg-red-100 text-red-800"
      case "save":
        return "bg-purple-100 text-purple-800"
      case "shot":
        return "bg-yellow-100 text-yellow-800"
      case "hit":
        return "bg-orange-100 text-orange-800"
      case "block":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Game Status and Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {game.team1?.name} vs {game.team2?.name}
            </CardTitle>
            <Badge variant={game.status === "in_progress" ? "default" : "secondary"}>
              {game.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">{game.team1_score}</div>
              <div className="text-lg font-medium text-slate-700">{game.team1?.name}</div>
            </div>
            <div className="text-2xl font-bold text-slate-400">-</div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">{game.team2_score}</div>
              <div className="text-lg font-medium text-slate-700">{game.team2?.name}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Active Scorers: {activeScorers.join(", ")} ({activeScorers.length} people)
            </div>
            <div className="space-x-2">
              {game.status === "scheduled" && (
                <Button onClick={handleStartGame} className="bg-green-600 hover:bg-green-700">
                  Start Game
                </Button>
              )}
              {game.status === "in_progress" && (
                <>
                  <Button
                    onClick={() => setShowScoringForm(!showScoringForm)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {showScoringForm ? "Hide" : "Add"} Scoring Event
                  </Button>
                  <Button onClick={handleEndGame} variant="outline">
                    End Game
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Management */}
      <GameManagement gameId={game.id} />

      {/* Scoring Form */}
      {showScoringForm && game.status === "in_progress" && (
        <Card>
          <CardHeader>
            <CardTitle>Add Scoring Event</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoringEventForm
              gameId={game.id}
              team1={game.team1!}
              team2={game.team2!}
              onEventAdded={() => {
                setShowScoringForm(false)
                updateGameScore(game.id)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Live Events Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No events yet</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl">{getEventIcon(event.event_type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge className={getEventColor(event.event_type)}>{event.event_type.toUpperCase()}</Badge>
                      <span className="font-medium">{event.player?.name}</span>
                      <span className="text-slate-500">({event.team?.name})</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Period {event.period} - {event.time_in_period}
                      {event.description && ` - ${event.description}`}
                    </div>
                    <div className="text-xs text-slate-400">
                      Scored by {event.scorer?.name} at {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
