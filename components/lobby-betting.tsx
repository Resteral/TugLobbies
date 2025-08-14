"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, TrendingUp, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { placeBet } from "@/lib/actions"

interface LobbyBettingProps {
  lobbyId: string
  currentPlayer: any
  lobbyPlayers: any[]
}

export default function LobbyBetting({ lobbyId, currentPlayer, lobbyPlayers }: LobbyBettingProps) {
  const [bets, setBets] = useState<any[]>([])
  const [betAmount, setBetAmount] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<"team1" | "team2" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Fetch existing bets
    const fetchBets = async () => {
      const { data } = await supabase
        .from("game_bets")
        .select("*")
        .eq("lobby_id", lobbyId)
        .order("created_at", { ascending: false })

      setBets(data || [])
    }

    fetchBets()

    // Set up real-time subscription for bets
    const channel = supabase
      .channel(`bets-${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_bets",
          filter: `lobby_id=eq.${lobbyId}`,
        },
        () => {
          fetchBets()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lobbyId])

  const handlePlaceBet = async () => {
    if (!selectedTeam || !betAmount || isLoading) return

    setIsLoading(true)
    await placeBet(lobbyId, currentPlayer.name, selectedTeam, Number.parseFloat(betAmount))
    setBetAmount("")
    setSelectedTeam(null)
    setIsLoading(false)
  }

  const team1Bets = bets.filter((bet) => bet.team_bet === "team1")
  const team2Bets = bets.filter((bet) => bet.team_bet === "team2")
  const team1Total = team1Bets.reduce((sum, bet) => sum + bet.amount, 0)
  const team2Total = team2Bets.reduce((sum, bet) => sum + bet.amount, 0)
  const totalPool = team1Total + team2Total

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <DollarSign className="h-5 w-5 text-green-400" />
        <h2 className="text-xl font-semibold">Live Betting</h2>
      </div>

      {/* Betting Pool Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">${team1Total}</div>
            <div className="text-sm text-gray-400">Team 1 Pool</div>
            <div className="text-xs text-gray-500">{team1Bets.length} bets</div>
          </div>
        </div>
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">${team2Total}</div>
            <div className="text-sm text-gray-400">Team 2 Pool</div>
            <div className="text-xs text-gray-500">{team2Bets.length} bets</div>
          </div>
        </div>
      </div>

      {/* Odds Display */}
      {totalPool > 0 && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-lg font-semibold">Team 1 Odds</div>
              <div className="text-green-400">{(team2Total / team1Total + 1).toFixed(2)}:1</div>
            </div>
            <TrendingUp className="h-6 w-6 text-gray-400" />
            <div className="text-center">
              <div className="text-lg font-semibold">Team 2 Odds</div>
              <div className="text-green-400">{(team1Total / team2Total + 1).toFixed(2)}:1</div>
            </div>
          </div>
        </div>
      )}

      {/* Place Bet Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Team</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedTeam === "team1" ? "default" : "outline"}
              onClick={() => setSelectedTeam("team1")}
              className="w-full"
            >
              Team 1
            </Button>
            <Button
              variant={selectedTeam === "team2" ? "default" : "outline"}
              onClick={() => setSelectedTeam("team2")}
              className="w-full"
            >
              Team 2
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bet Amount ($)</label>
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            step="0.01"
          />
        </div>

        <Button onClick={handlePlaceBet} disabled={!selectedTeam || !betAmount || isLoading} className="w-full">
          <DollarSign className="h-4 w-4 mr-2" />
          Place Bet
        </Button>
      </div>

      {/* Recent Bets */}
      {bets.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Recent Bets</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {bets.slice(0, 10).map((bet) => (
              <div key={bet.id} className="flex items-center justify-between text-sm p-2 bg-gray-700 rounded">
                <div className="flex items-center space-x-2">
                  <Users className="h-3 w-3" />
                  <span>{bet.player_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={bet.team_bet === "team1" ? "text-blue-400" : "text-red-400"}>
                    {bet.team_bet === "team1" ? "Team 1" : "Team 2"}
                  </span>
                  <span className="text-green-400">${bet.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
