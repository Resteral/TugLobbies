import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Trophy, Target, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function QuickActions() {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Target className="h-5 w-5 text-green-400" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/lobby/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Lobby
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
        >
          <Link href="/lobbies">
            <Users className="h-4 w-4 mr-2" />
            Browse Lobbies
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
        >
          <Link href="/tournaments">
            <Trophy className="h-4 w-4 mr-2" />
            View Tournaments
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
        >
          <Link href="/leaderboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Leaderboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
