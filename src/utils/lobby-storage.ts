/**
 * Lobby storage utilities for persistent lobby management
 */

import { StoredLobby, StoredLobbyPlayer } from '../types/zealot-hockey';

const STORAGE_KEY = 'tug-lobbies';

/**
 * Load lobbies from localStorage
 */
export const loadLobbies = (): StoredLobby[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const lobbies = JSON.parse(stored);
      // Convert date strings back to Date objects
      return lobbies.map((lobby: any) => ({
        ...lobby,
        createdAt: new Date(lobby.createdAt),
        players: lobby.players.map((player: any) => ({
          ...player,
          lastPlayed: new Date(player.lastPlayed),
          joinDate: new Date(player.joinDate)
        }))
      }));
    }
  } catch (error) {
    console.error('Error loading lobbies from storage:', error);
  }
  return [];
};

/**
 * Save lobbies to localStorage
 */
export const saveLobbies = (lobbies: StoredLobby[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lobbies));
  } catch (error) {
    console.error('Error saving lobbies to storage:', error);
  }
};

/**
 * Get lobby by ID
 */
export const getLobbyById = (lobbyId: string): StoredLobby | null => {
  const lobbies = loadLobbies();
  return lobbies.find(lobby => lobby.id === lobbyId) || null;
};

/**
 * Update a lobby
 */
export const updateLobby = (updatedLobby: StoredLobby): void => {
  const lobbies = loadLobbies();
  const updatedLobbies = lobbies.map(lobby => 
    lobby.id === updatedLobby.id ? updatedLobby : lobby
  );
  saveLobbies(updatedLobbies);
};

/**
 * Create a new lobby
 */
export const createLobby = (lobbyData: Partial<StoredLobby>): StoredLobby => {
  const newLobby: StoredLobby = {
    id: lobbyData.id || Date.now().toString(),
    name: lobbyData.name || 'New Lobby',
    gameType: lobbyData.gameType || 'zealot-hockey',
    players: lobbyData.players || [],
    captainIds: lobbyData.captainIds || [],
    status: lobbyData.status || 'waiting',
    createdBy: lobbyData.createdBy || 'System',
    createdAt: new Date(),
    draftType: lobbyData.draftType || 'snake',
    maxPlayers: lobbyData.maxPlayers || 6,
    ...lobbyData
  };

  const lobbies = loadLobbies();
  const updatedLobbies = [...lobbies, newLobby];
  saveLobbies(updatedLobbies);
  
  return newLobby;
};

/**
 * Delete a lobby
 */
export const deleteLobby = (lobbyId: string): void => {
  const lobbies = loadLobbies();
  const updatedLobbies = lobbies.filter(lobby => lobby.id !== lobbyId);
  saveLobbies(updatedLobbies);
};