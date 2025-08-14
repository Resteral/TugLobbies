import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GameScoring from "@/components/game-scoring"
import BettingPanel from "@/components/betting-panel"

interface GamePageProps {
  params: {
    id: string
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get game session
  const { data: gameSession } = await supabase.from("game_sessions").select("*").eq("id", params.id).single()

  if (!gameSession) {
    redirect("/dashboard")
  }

  // Get score submissions
  const { data: scoreSubmissions } = await supabase
    .from("score_submissions")
    .select("*")
    .eq("lobby_id", gameSession.lobby_id)
    .order("created_at", { ascending: false })

  // Get current user's player data
  const { data: currentPlayer } = await supabase.from("player_stats").select("*").eq("id", user.id).single()

  // Get all players in the game
  const allPlayers = [...(gameSession.team1 || []), ...(gameSession.team2 || [])]
  const { data: playerStats } = await supabase.from("player_stats").select("*").in("player_name", allPlayers)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Game Scoring - Takes up 3 columns */}
          <div className="xl:col-span-3">
            <GameScoring
              gameSession={gameSession}
              scoreSubmissions={scoreSubmissions || []}
              currentPlayer={currentPlayer}
              allPlayers={playerStats || []}
            />
          </div>

          {/* Betting Panel - Takes up 1 column */}
          <div className="xl:col-span-1">
            <BettingPanel
              gameId={params.id}
              playerName={currentPlayer?.player_name || ""}
              team1={gameSession.team1 || []}
              team2={gameSession.team2 || []}
              gameStatus={gameSession.status}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
