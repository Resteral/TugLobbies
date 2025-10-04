/**
 * Tournament storage utilities
 * Purpose: Provide a safe, localStorage-backed CRUD for tournaments used by various pages.
 * Fixes build issues by replacing placeholder content with valid TypeScript.
 */

export type TournamentType = 'single-elimination' | 'double-elimination' | 'round-robin';

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  createdAt: string; // ISO
  status: 'draft' | 'active' | 'completed';
  teams: string[];
}

const STORAGE_KEY = 'tug.tournaments.v1';

/**
 * Internal: get a storage-safe reference (SSR guard).
 */
function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Internal: in-memory fallback when localStorage is not available (SSR).
 */
const memoryStore = new Map<string, string>();

/**
 * Load all tournaments from storage.
 */
export async function getTournaments(): Promise<Tournament[]> {
  const store = getStorage();
  const raw = store ? store.getItem(STORAGE_KEY) : memoryStore.get(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Tournament[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist tournaments.
 */
async function setTournaments(list: Tournament[]): Promise<void> {
  const json = JSON.stringify(list);
  const store = getStorage();
  if (store) {
    store.setItem(STORAGE_KEY, json);
  } else {
    memoryStore.set(STORAGE_KEY, json);
  }
}

/**
 * Get a tournament by id.
 */
export async function getTournamentById(id: string): Promise<Tournament | null> {
  const list = await getTournaments();
  return list.find((t) => t.id === id) ?? null;
}

/**
 * Create a new tournament.
 */
export async function createTournament(partial: Partial<Tournament>): Promise<Tournament> {
  const list = await getTournaments();
  const now = new Date().toISOString();
  const t: Tournament = {
    id: partial.id ?? `t_${Date.now()}`,
    name: partial.name ?? 'New Tournament',
    type: partial.type ?? 'single-elimination',
    status: partial.status ?? 'draft',
    createdAt: partial.createdAt ?? now,
    teams: partial.teams ?? [],
  };
  list.push(t);
  await setTournaments(list);
  return t;
}

/**
 * Update an existing tournament.
 */
export async function updateTournament(updated: Tournament): Promise<Tournament> {
  const list = await getTournaments();
  const idx = list.findIndex((t) => t.id === updated.id);
  if (idx >= 0) {
    list[idx] = updated;
    await setTournaments(list);
    return updated;
  }
  // if not found, create it
  list.push(updated);
  await setTournaments(list);
  return updated;
}

/**
 * Delete a tournament by id.
 */
export async function deleteTournament(id: string): Promise<void> {
  const list = await getTournaments();
  const next = list.filter((t) => t.id !== id);
  await setTournaments(next);
}

/**
 * Aliases for compatibility with other imports.
 */
export const listTournaments = getTournaments;
