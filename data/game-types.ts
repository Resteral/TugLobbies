/**
 * Supported game types for the matchmaking system
 */

import { GameType } from '../types/zealot-hockey';

export const gameTypes: GameType[] = [
  {
    id: 'zealot-hockey',
    name: 'Zealot Hockey',
    description: 'Classic Zealot Hockey - 1v1',
    teamSize: 1,
    maxPlayers: 2,
    icon: '🏒'
  },
  {
    id: '2v2-hockey',
    name: '2v2 Hockey',
    description: 'Team Zealot Hockey - 2v2',
    teamSize: 2,
    maxPlayers: 4,
    icon: '🏒'
  },
  {
    id: '3v3-hockey',
    name: '3v3 Hockey',
    description: 'Team Zealot Hockey - 3v3',
    teamSize: 3,
    maxPlayers: 6,
    icon: '🏒'
  },
  {
    id: '4v4-hockey',
    name: '4v4 Hockey',
    description: 'Team Zealot Hockey - 4v4',
    teamSize: 4,
    maxPlayers: 8,
    icon: '🏒'
  },
  {
    id: 'starcraft-1v1',
    name: 'StarCraft 1v1',
    description: 'Traditional StarCraft 1v1',
    teamSize: 1,
    maxPlayers: 2,
    icon: '⭐'
  },
  {
    id: 'starcraft-2v2',
    name: 'StarCraft 2v2',
    description: 'Team StarCraft - 2v2',
    teamSize: 2,
    maxPlayers: 4,
    icon: '⭐'
  },
  {
    id: 'starcraft-3v3',
    name: 'StarCraft 3v3',
    description: 'Team StarCraft - 3v3',
    teamSize: 3,
    maxPlayers: 6,
    icon: '⭐'
  },
  {
    id: 'starcraft-4v4',
    name: 'StarCraft 4v4',
    description: 'Team StarCraft - 4v4',
    teamSize: 4,
    maxPlayers: 8,
    icon: '⭐'
  },
  {
    id: 'custom-game',
    name: 'Custom Game',
    description: 'Custom game mode',
    teamSize: 1,
    maxPlayers: 12,
    icon: '🎮'
  }
];

export const getGameTypeById = (id: string): GameType | undefined => {
  return gameTypes.find(game => game.id === id);
};

export const getGameTypesByTeamSize = (teamSize: number): GameType[] => {
  return gameTypes.filter(game => game.teamSize === teamSize);
};