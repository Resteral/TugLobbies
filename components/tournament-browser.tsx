"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users, DollarSign, Calendar, Crown } from "lucide-react"
import Link from "next/link"

interface TournamentBrowserProps {
  tournaments: any[]
}

export default function TournamentBrowser({ tournaments }: TournamentBrowserProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "active":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "registration":
        return "Registration Open"
      case "active":
        return "In Progress"
      case "completed":
        return "Completed"
      default:
        return status
    }
  }

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold text-white mb-2">No Tournaments Yet</h2>
        <p className="text-gray-400 mb-6">Be the first to create a tournament!</p>
        <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
          <Link href="/tournament/create">Create Tournament</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => (
        <Card key={tournament.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-white flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="truncate">{tournament.name}</span>
              </CardTitle>
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(tournament.status)}`}>
                {getStatusLabel(tournament.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <Users className="h-4 w-4" />
                <span>
                  {tournament.tournament_participants?.[0]?.count || 0}/{tournament.max_teams}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Crown className="h-4 w-4" />
                <span>{tournament.type}</span>
              </div>
            </div>

            {tournament.prize_pool > 0 && (
              <div className="flex items-center space-x-2 text-green-400">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">${tournament.prize_pool} Prize Pool</span>
              </div>
            )}

            {tournament.entry_fee > 0 && (
              <div className="text-sm text-gray-400">Entry Fee: ${tournament.entry_fee}</div>
            )}

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Created {new Date(tournament.created_at).toLocaleDateString()}</span>
            </div>

            <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700">
              <Link href={`/tournament/${tournament.id}`}>
                {tournament.status === "registration" ? "Register" : "View Tournament"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
