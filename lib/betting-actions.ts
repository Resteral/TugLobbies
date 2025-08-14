"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function placeBet(
  gameId: string,
  bettorName: string,
  betAmount: number,
  betType: string,
  betTarget?: string,
) {
  const supabase = createClient()

  try {
    // Check player balance
    const { data: balance } = await supabase
      .from("player_balances")
      .select("balance")
      .eq("player_name", bettorName)
      .single()

    if (!balance || balance.balance < betAmount) {
      return { error: "Insufficient balance" }
    }

    // Calculate odds and payout (simplified odds system)
    let odds = 2.0
    if (betType === "team1_win" || betType === "team2_win") {
      odds = 1.85 // Slightly lower odds for team wins
    } else if (betType === "over_total" || betType === "under_total") {
      odds = 1.9 // Odds for total score bets
    }

    const potentialPayout = Math.floor(betAmount * odds)

    // Place the bet
    const { error: betError } = await supabase.from("game_bets").insert({
      game_id: gameId,
      bettor_name: bettorName,
      bet_amount: betAmount,
      bet_type: betType,
      bet_target: betTarget,
      odds,
      potential_payout: potentialPayout,
    })

    if (betError) {
      return { error: "Failed to place bet" }
    }

    // Update player balance
    const { error: balanceError } = await supabase
      .from("player_balances")
      .update({
        balance: balance.balance - betAmount,
        total_wagered: supabase.raw("total_wagered + ?", [betAmount]),
        updated_at: new Date().toISOString(),
      })
      .eq("player_name", bettorName)

    if (balanceError) {
      return { error: "Failed to update balance" }
    }

    revalidatePath("/game/[id]", "page")
    return { success: true }
  } catch (error) {
    return { error: "An error occurred while placing bet" }
  }
}

export async function getPlayerBalance(playerName: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("player_balances").select("*").eq("player_name", playerName).single()

  if (error) {
    // Create balance if doesn't exist
    const { data: newBalance } = await supabase
      .from("player_balances")
      .insert({ player_name: playerName, balance: 1000 })
      .select()
      .single()

    return newBalance
  }

  return data
}

export async function getGameBets(gameId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("game_bets")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return data
}

export async function resolveBets(
  gameId: string,
  team1Score: number,
  team2Score: number,
  team1: string[],
  team2: string[],
) {
  const supabase = createClient()

  try {
    // Get all pending bets for this game
    const { data: bets } = await supabase.from("game_bets").select("*").eq("game_id", gameId).eq("status", "pending")

    if (!bets || bets.length === 0) return

    const totalScore = team1Score + team2Score
    const winner = team1Score > team2Score ? "team1" : team2Score > team1Score ? "team2" : "tie"

    for (const bet of bets) {
      let isWinner = false

      switch (bet.bet_type) {
        case "team1_win":
          isWinner = winner === "team1"
          break
        case "team2_win":
          isWinner = winner === "team2"
          break
        case "over_total":
          isWinner = totalScore > Number.parseInt(bet.bet_target || "10")
          break
        case "under_total":
          isWinner = totalScore < Number.parseInt(bet.bet_target || "10")
          break
      }

      // Update bet status
      await supabase
        .from("game_bets")
        .update({
          status: isWinner ? "won" : "lost",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", bet.id)

      // Update player balance if won
      if (isWinner) {
        const { data: currentBalance } = await supabase
          .from("player_balances")
          .select("balance, total_won")
          .eq("player_name", bet.bettor_name)
          .single()

        if (currentBalance) {
          await supabase
            .from("player_balances")
            .update({
              balance: currentBalance.balance + bet.potential_payout,
              total_won: currentBalance.total_won + bet.potential_payout,
              updated_at: new Date().toISOString(),
            })
            .eq("player_name", bet.bettor_name)
        }
      }
    }
  } catch (error) {
    console.error("Error resolving bets:", error)
  }
}
