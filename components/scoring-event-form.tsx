"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { addScoringEvent } from "@/lib/actions"

interface Team {
  id: string
  name: string
}

interface Player {
  id: string
  name: string
  team_id: string
}

export function ScoringEventForm({
  gameId,
  team1,
  team2,
  onEventAdded,
}: {
  gameId: string
  team1: Team
  team2: Team
  onEventAdded: () => void
}) {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [eventType, setEventType] = useState<string>("")
  const [period, setPeriod] = useState<string>("1")
  const [timeInPeriod, setTimeInPeriod] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    const { data } = await supabase.from("players").select("*").in("team_id", [team1.id, team2.id])

    if (data) {
      setPlayers(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlayer || !eventType || !timeInPeriod) return

    setIsSubmitting(true)
    try {
      await addScoringEvent(gameId, {
        event_type: eventType as any,
        player_id: selectedPlayer,
        team_id: selectedTeam,
        period: Number.parseInt(period),
        time_in_period: timeInPeriod,
        description: description || undefined,
      })

      // Reset form
      setSelectedTeam("")
      setSelectedPlayer("")
      setEventType("")
      setPeriod("1")
      setTimeInPeriod("")
      setDescription("")

      onEventAdded()
    } catch (error) {
      console.error("Error adding scoring event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPlayers = players.filter((player) => (selectedTeam ? player.team_id === selectedTeam : true))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="team">Team</Label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={team1.id}>{team1.name}</SelectItem>
              <SelectItem value={team2.id}>{team2.name}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="player">Player</Label>
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger>
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {filteredPlayers.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="eventType">Event Type</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goal">Goal 🥅</SelectItem>
              <SelectItem value="assist">Assist 🏒</SelectItem>
              <SelectItem value="penalty">Penalty ⚠️</SelectItem>
              <SelectItem value="save">Save 🛡️</SelectItem>
              <SelectItem value="shot">Shot 🎯</SelectItem>
              <SelectItem value="hit">Hit 💥</SelectItem>
              <SelectItem value="block">Block 🚫</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="period">Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1st Period</SelectItem>
              <SelectItem value="2">2nd Period</SelectItem>
              <SelectItem value="3">3rd Period</SelectItem>
              <SelectItem value="4">Overtime</SelectItem>
              <SelectItem value="5">Shootout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="time">Time in Period</Label>
          <Input
            id="time"
            type="text"
            placeholder="e.g., 15:30"
            value={timeInPeriod}
            onChange={(e) => setTimeInPeriod(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Additional details about the event..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !selectedPlayer || !eventType || !timeInPeriod}
        className="w-full bg-orange-600 hover:bg-orange-700"
      >
        {isSubmitting ? "Adding Event..." : "Add Scoring Event"}
      </Button>
    </form>
  )
}
