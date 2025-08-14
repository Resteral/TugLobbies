"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface RealTimeContextType {
  isConnected: boolean
}

const RealTimeContext = createContext<RealTimeContextType>({ isConnected: false })

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to draft updates
    const draftChannel = supabase
      .channel("draft-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "draft_picks" }, (payload) => {
        if (payload.eventType === "INSERT") {
          toast({
            title: "Draft Update",
            description: "A new player has been drafted!",
          })
        }
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    // Subscribe to tournament updates
    const tournamentChannel = supabase
      .channel("tournament-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "games" }, (payload) => {
        if (payload.eventType === "UPDATE" && payload.new.status === "completed") {
          toast({
            title: "Tournament Update",
            description: "A game has been completed!",
          })
        }
      })
      .subscribe()

    // Subscribe to auction updates
    const auctionChannel = supabase
      .channel("auction-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "auction_bids" }, (payload) => {
        if (payload.eventType === "INSERT") {
          toast({
            title: "New Bid",
            description: `Bid placed: $${payload.new.amount}`,
          })
        }
      })
      .subscribe()

    // Subscribe to scoring updates
    const scoringChannel = supabase
      .channel("scoring-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "scoring_events" }, (payload) => {
        if (payload.eventType === "INSERT") {
          toast({
            title: "Goal Scored!",
            description: `${payload.new.event_type} recorded`,
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(draftChannel)
      supabase.removeChannel(tournamentChannel)
      supabase.removeChannel(auctionChannel)
      supabase.removeChannel(scoringChannel)
    }
  }, [])

  return <RealTimeContext.Provider value={{ isConnected }}>{children}</RealTimeContext.Provider>
}

export const useRealTime = () => useContext(RealTimeContext)
