/**
 * Lobby storage utility with localStorage backend (replaces Supabase for free version)
 */

import { StoredLobby, StoredLobbyPlayer } from '../types/zealot-hockey'

// Mock database using localStorage
const getFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(`tug_lobbies_${key}`);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

const setToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(`tug_lobbies_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Initialize with some demo data
const initializeDemoData = () => {
  const existingLobbies = getFromStorage('lobbies');
  if (existingLobbies.length === 0) {
    const demoLobbies: StoredLobby[] = [
      {
        id: 'lobby-1',
        name: 'Zealot Hockey 1v1 Lobby',
        gameType: 'zealot-hockey',
        players: [
          {
            id: 'demo-player-1',
            name: 'ZealotMaster',
            elo: 1450,
            matchesPlayed: 25,
            wins: 18,
            losses: 7,
            winRate: 72,
            lastPlayed: new Date(),
            joinDate: new Date(),
            gameStats: {},
            isCaptain: true,
            team: 'A',
            ready: true
          },
          {
            id: 'demo-player-2',
            name: 'HockeyPro',
            elo: 1380,
            matchesPlayed: 22,
            wins: 15,
            losses: 7,
            winRate: 68,
            lastPlayed: new Date(),
            joinDate: new Date(),
            gameStats: {},
            isCaptain: true,
            team: 'B',
            ready: true
          }
        ],
        captainIds: ['demo-player-1', 'demo-player-2'],
        status: 'waiting',
        createdBy: 'System',
        createdAt: new Date(),
        draftType: 'snake',
        maxPlayers: 2
      }
    ];
    setToStorage('lobbies', demoLobbies);
  }
};

export const loadLobbies = async (): Promise<StoredLobby[]> => {
  initializeDemoData();
  const lobbies = getFromStorage('lobbies');
  return lobbies.map((lobby: any) => ({
    ...lobby,
    createdAt: new Date(lobby.createdAt),
    players: lobby.players.map((player: any) => ({
      ...player,
      lastPlayed: new Date(player.lastPlayed),
      joinDate: new Date(player.joinDate)
    }))
  }));
};

export const getLobbyById = async (lobbyId: string): Promise<StoredLobby | null> => {
  const lobbies = getFromStorage('lobbies');
  const lobby = lobbies.find((l: StoredLobby) => l.id === lobbyId);
  
  if (!lobby) return null;
  
  return {
    ...lobby,
    createdAt: new Date(lobby.createdAt),
    players: lobby.players.map((player: any) => ({
      ...player,
      lastPlayed: new Date(player.lastPlayed),
      joinDate: new Date(player.joinDate)
    }))
  };
};

export const createLobby = async (lobbyData: {
  name: string;
  gameType: string;
  players: StoredLobbyPlayer[];
  captainIds: string[];
  status: 'waiting' | 'drafting' | 'ready' | 'in-progress';
  createdBy: string;
  draftType: 'snake' | 'auction';
  maxPlayers: number;
  id?: string;
}): Promise<StoredLobby> => {
  const lobbies = getFromStorage('lobbies');
  const lobbyId = lobbyData.id || `lobby-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newLobby: StoredLobby = {
    id: lobbyId,
    name: lobbyData.name,
    gameType: lobbyData.gameType,
    players: lobbyData.players,
    captainIds: lobbyData.captainIds,
    status: lobbyData.status,
    createdBy: lobbyData.createdBy,
    createdAt: new Date(),
    draftType: lobbyData.draftType,
    maxPlayers: lobbyData.maxPlayers
  };
  
  lobbies.push(newLobby);
  setToStorage('lobbies', lobbies);
  
  return newLobby;
};

export const updateLobby = async (lobby: StoredLobby): Promise<void> => {
  const lobbies = getFromStorage('lobbies');
  const lobbyIndex = lobbies.findIndex((l: StoredLobby) => l.id === lobby.id);
  
  if (lobbyIndex !== -1) {
    lobbies[lobbyIndex] = lobby;
    setToStorage('lobbies', lobbies);
  }
};

export const deleteLobby = async (lobbyId: string): Promise<void> => {
  const lobbies = getFromStorage('lobbies');
  const filteredLobbies = lobbies.filter((l: StoredLobby) => l.id !== lobbyId);
  setToStorage('lobbies', filteredLobbies);
};