import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lock, Globe, Clock } from "lucide-react"
import Link from "next/link"

interface ActiveLobbiesProps {
  lobbies: any[]
}

export default function ActiveLobbies({ lobbies }: ActiveLobbiesProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-400" />
          <span>Active Lobbies</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lobbies.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active lobbies found</p>
            <p className="text-sm">Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lobbies.map((lobby) => (
              <div key={lobby.id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {lobby.is_private ? (
                        <Lock className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Globe className="h-4 w-4 text-green-500" />
                      )}
                      <h3 className="font-semibold text-white">{lobby.name}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {lobby.current_players?.length || 0}/{lobby.max_players}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(lobby.created_at).toLocaleTimeString()}</span>
                      </span>
                    </div>
                  </div>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Link href={`/lobby/${lobby.id}`}>Join</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
