/**
 * Discord Activity Component
 * Main lobby system with ELO snake draft functionality
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Users, Gamepad2, Trophy, Plus, UserPlus, Crown } from 'lucide-react'
import { Player, StoredLobby } from '../../types/zealot-hockey'

interface DiscordActivityProps {
  players: Player[]
  lobbies: StoredLobby[]
  onCreateLobby: (gameTypeId: string, draftType: 'snake' | 'auction') => Promise<StoredLobby>
  onJoinLobby: (lobbyId: string) => void
}

export const DiscordActivity: React.FC<DiscordActivityProps> = ({
  players,
  lobbies,
  onCreateLobby,
  onJoinLobby
}) => {
  const [selectedGameType, setSelectedGameType] = useState('zealot-hockey')
  const [selectedDraftType, setSelectedDraftType] = useState<'snake' | 'auction'>('snake')

  const gameTypes = [
    { id: 'zealot-hockey', name: 'Zealot Hockey 1v1', maxPlayers: 2 },
    { id: '2v2-hockey', name: 'Zealot Hockey 2v2', maxPlayers: 4 },
    { id: '3v3-hockey', name: 'Zealot Hockey 3v3', maxPlayers: 6 },
    { id: '4v4-hockey', name: 'Zealot Hockey 4v4', maxPlayers: 8 },
    { id: '1v1-sc2', name: 'StarCraft II 1v1', maxPlayers: 2 },
    { id: '2v2-sc2', name: 'StarCraft II 2v2', maxPlayers: 4 },
    { id: '3v3-sc2', name: 'StarCraft II 3v3', maxPlayers: 6 },
    { id: '4v4-sc2', name: 'StarCraft II 4v4', maxPlayers: 8 }
  ]

  const handleCreateLobby = async () => {
    await onCreateLobby(selectedGameType, selectedDraftType)
  }

  const getGameTypeName = (gameTypeId: string) => {
    return gameTypes.find(gt => gt.id === gameTypeId)?.name || gameTypeId
  }

  const getLobbyStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500'
      case 'drafting': return 'bg-blue-500'
      case 'ready': return 'bg-green-500'
      case 'in-progress': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Lobby Section */}
      <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-800/30 border-blue-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Plus className="w-5 h-5 text-blue-400" />
            <span>Create New Lobby</span>
          </CardTitle>
          <CardDescription className="text-blue-200">
            Start a new match with ELO-based team balancing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Game Type</label>
              <Select value={selectedGameType} onValueChange={setSelectedGameType}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {gameTypes.map(gameType => (
                    <SelectItem key={gameType.id} value={gameType.id}>
                      {gameType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Draft Type</label>
              <Select value={selectedDraftType} onValueChange={(value: 'snake' | 'auction') => setSelectedDraftType(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select draft type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="snake">Snake Draft</SelectItem>
                  <SelectItem value="auction">Auction Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleCreateLobby}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Create Lobby
              </Button>
            </div>
          </div>

          <div className="bg-blue-800/20 rounded-lg p-3 border border-blue-600/50">
            <div className="text-sm text-blue-300">
              <strong>Snake Draft:</strong> Teams take turns picking players
            </div>
            <div className="text-sm text-blue-300">
              <strong>Auction Draft:</strong> Teams bid ELO points for players
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Lobbies */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-400" />
            <span>Active Lobbies</span>
            <Badge variant="secondary" className="bg-green-600">
              {lobbies.length} Active
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Join existing lobbies or spectate ongoing matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lobbies.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active lobbies. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lobbies.map(lobby => (
                <div key={lobby.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-white font-semibold">{lobby.name}</h3>
                      <Badge className={getLobbyStatusColor(lobby.status)}>
                        {lobby.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-300 text-sm">
                        {lobby.players.length}/{lobby.maxPlayers} players
                      </div>
                      <Button 
                        onClick={() => onJoinLobby(lobby.id)}
                        disabled={lobby.players.length >= lobby.maxPlayers}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-gray-300">
                      <strong>Game:</strong> {getGameTypeName(lobby.gameType)}
                    </div>
                    <div className="text-gray-300">
                      <strong>Draft:</strong> {lobby.draftType}
                    </div>
                    <div className="text-gray-300">
                      <strong>Created by:</strong> {lobby.createdBy}
                    </div>
                  </div>

                  {/* Players in Lobby */}
                  {lobby.players.length > 0 && (
                    <div className="mt-3">
                      <div className="text-gray-400 text-sm mb-2">Players:</div>
                      <div className="flex flex-wrap gap-2">
                        {lobby.players.map(player => (
                          <Badge key={player.id} variant="outline" className="bg-transparent border-gray-500">
                            <div className="flex items-center space-x-1">
                              {lobby.captainIds.includes(player.id) && (
                                <Crown className="w-3 h-3 text-yellow-400" />
                              )}
                              <span>{player.name}</span>
                              <span className="text-gray-400">({player.elo})</span>
                            </div>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}