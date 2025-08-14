"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { addScorer } from "@/lib/actions"

interface Profile {
  id: string
  name: string
  email: string
}

interface GameScorer {
  id: string
  user_id: string
  profiles: Profile
}

export function GameManagement({ gameId }: { gameId: string }) {
  const [scorers, setScorers] = useState<GameScorer[]>([])
  const [searchEmail, setSearchEmail] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAddingScorer, setIsAddingScorer] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchScorers()
  }, [gameId])

  const fetchScorers = async () => {
    const { data } = await supabase.from("game_scorers").select("*, profiles(*)").eq("game_id", gameId)

    if (data) {
      setScorers(data)
    }
  }

  const searchUsers = async () => {
    if (!searchEmail.trim()) return

    setIsSearching(true)
    const { data } = await supabase.from("profiles").select("*").ilike("email", `%${searchEmail}%`).limit(5)

    if (data) {
      // Filter out users who are already scorers
      const existingScorerIds = scorers.map((s) => s.user_id)
      setSearchResults(data.filter((user) => !existingScorerIds.includes(user.id)))
    }
    setIsSearching(false)
  }

  const handleAddScorer = async (userId: string) => {
    setIsAddingScorer(true)
    try {
      await addScorer(gameId, userId)
      await fetchScorers()
      setSearchEmail("")
      setSearchResults([])
    } catch (error) {
      console.error("Error adding scorer:", error)
    } finally {
      setIsAddingScorer(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Scorers Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Scorers */}
        <div>
          <Label className="text-sm font-medium">Current Scorers ({scorers.length})</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {scorers.map((scorer) => (
              <Badge key={scorer.id} variant="secondary">
                {scorer.profiles.name} ({scorer.profiles.email})
              </Badge>
            ))}
          </div>
          {scorers.length === 0 && <p className="text-slate-500 text-sm mt-2">No scorers assigned yet</p>}
        </div>

        {/* Add New Scorer */}
        <div className="border-t pt-4">
          <Label htmlFor="searchEmail" className="text-sm font-medium">
            Add New Scorer
          </Label>
          <div className="flex space-x-2 mt-2">
            <Input
              id="searchEmail"
              type="email"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUsers()}
            />
            <Button onClick={searchUsers} disabled={isSearching || !searchEmail.trim()} variant="outline">
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              <Label className="text-sm font-medium">Search Results</Label>
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-slate-600">{user.email}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddScorer(user.id)}
                    disabled={isAddingScorer}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Add as Scorer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
          <strong>Note:</strong> Scorers can add real-time scoring events during the game. You can add up to 10 scorers
          per game to ensure comprehensive coverage.
        </div>
      </CardContent>
    </Card>
  )
}
