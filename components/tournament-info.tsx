import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users } from "lucide-react"
import Link from "next/link"

interface TournamentInfoProps {
  tournaments: any[]
}

export default function TournamentInfo({ tournaments }: TournamentInfoProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Tournaments</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tournaments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active tournaments</p>
            <p className="text-sm">Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="p-4 bg-gray-700/50 rounded-lg">
                <h3 className="font-semibold text-white mb-2">{tournament.name}</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3" />
                    <span>Max Teams: {tournament.max_teams}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-3 w-3" />
                    <span>Prize Pool: ${tournament.prize_pool}</span>
                  </div>
                </div>
                <Button asChild size="sm" className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700">
                  <Link href={`/tournament/${tournament.id}`}>
                    {tournament.status === "registration" ? "Register" : "View"}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
