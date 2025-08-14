"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Trophy } from "lucide-react"
import { useState, useEffect } from "react"
import { placeBet, getPlayerBalance, getGameBets } from "@/lib/betting-actions"
import { createClient } from "@/lib/supabase/client"

interface BettingPanelProps {
  gameId: string
  playerName: string
  team1: string[]
  team2: string[]
  gameStatus: string
}

export default function BettingPanel({ gameId, playerName, team1, team2, gameStatus }: BettingPanelProps) {
  const [balance, setBalance] = useState<any>(null)
  const [bets, setBets] = useState<any[]>([])
  const [betAmount, setBetAmount] = useState("")
  const [betType, setBetType] = useState("")
  const [betTarget, setBetTarget] = useState("")
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadBalance()
    loadBets()

    // Set up real-time subscription for bets
    const betsSubscription = supabase
      .channel(`game_bets_${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_bets",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          loadBets()
        },
      )
      .subscribe()

    return () => {
      betsSubscription.unsubscribe()
    }
  }, [gameId, supabase])

  const loadBalance = async () => {
    const balanceData = await getPlayerBalance(playerName)
    setBalance(balanceData)
  }

  const loadBets = async () => {
    const betsData = await getGameBets(gameId)
    setBets(betsData)
  }

  const handlePlaceBet = async () => {
    if (!betAmount || !betType || Number.parseInt(betAmount) <= 0) return

    setIsPlacingBet(true)
    const result = await placeBet(gameId, playerName, Number.parseInt(betAmount), betType, betTarget)

    if (result.error) {
      alert(result.error)
    } else {
      setBetAmount("")
      setBetType("")
      setBetTarget("")
      loadBalance()
      loadBets()
    }

    setIsPlacingBet(false)
  }

  const canBet = gameStatus === "active" && balance && balance.balance >= Number.parseInt(betAmount || "0")
  const myBets = bets.filter((bet) => bet.bettor_name === playerName)
  const totalBets = bets.reduce((sum, bet) => sum + bet.bet_amount, 0)

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-400" />
          <span>Betting</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Balance */}
        <div className="bg-gray-700/50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Your Balance:</span>
            <span className="text-green-400 font-bold">{balance?.balance || 0} credits</span>
          </div>
        </div>

        {/* Betting Form */}
        {gameStatus === "active" && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="bet-amount" className="text-gray-300">
                Bet Amount
              </Label>
              <Input
                id="bet-amount"
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-gray-700 border-gray-600 text-white"
                min="1"
                max={balance?.balance || 0}
              />
            </div>

            <div>
              <Label htmlFor="bet-type" className="text-gray-300">
                Bet Type
              </Label>
              <Select value={betType} onValueChange={setBetType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select bet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1_win">Team 1 Wins (1.85x)</SelectItem>
                  <SelectItem value="team2_win">Team 2 Wins (1.85x)</SelectItem>
                  <SelectItem value="over_total">Over Total Score (1.90x)</SelectItem>
                  <SelectItem value="under_total">Under Total Score (1.90x)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(betType === "over_total" || betType === "under_total") && (
              <div>
                <Label htmlFor="bet-target" className="text-gray-300">
                  Total Score
                </Label>
                <Input
                  id="bet-target"
                  type="number"
                  value={betTarget}
                  onChange={(e) => setBetTarget(e.target.value)}
                  placeholder="e.g., 10"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            )}

            <Button
              onClick={handlePlaceBet}
              disabled={!canBet || isPlacingBet}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isPlacingBet ? "Placing Bet..." : "Place Bet"}
            </Button>
          </div>
        )}

        {/* My Bets */}
        {myBets.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>Your Bets</span>
            </h4>
            {myBets.map((bet) => (
              <div key={bet.id} className="bg-gray-700/50 p-2 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">
                    {bet.bet_type.replace("_", " ").toUpperCase()}
                    {bet.bet_target && ` (${bet.bet_target})`}
                  </span>
                  <span
                    className={`font-medium ${
                      bet.status === "won"
                        ? "text-green-400"
                        : bet.status === "lost"
                          ? "text-red-400"
                          : "text-yellow-400"
                    }`}
                  >
                    {bet.bet_amount} → {bet.potential_payout}
                  </span>
                </div>
                <div className="text-xs text-gray-500 capitalize">{bet.status}</div>
              </div>
            ))}
          </div>
        )}

        {/* Game Betting Stats */}
        <div className="bg-gray-700/50 p-3 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total Wagered:</span>
            <span className="text-blue-400 font-medium">{totalBets} credits</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Active Bets:</span>
            <span className="text-blue-400 font-medium">{bets.filter((b) => b.status === "pending").length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
