/**
 * Mock Supabase client for TUG Lobbies
 * Provides the same interface as @supabase/supabase-js but uses localStorage
 */

interface SupabaseClient {
  from: (table: string) => any;
  auth: any;
  channel: (name: string) => any;
}

interface MockTable {
  select: (query?: string) => any;
  insert: (data: any) => any;
  update: (data: any) => any;
  delete: () => any;
  eq: (column: string, value: any) => any;
  single: () => any;
  order: (column: string, options: any) => any;
  limit: (count: number) => any;
}

class MockSupabaseClient implements SupabaseClient {
  private storageKey = 'tug-lobbies-data';
  
  from(table: string): MockTable {
    return {
      select: (query = '*') => this.handleSelect(table, query),
      insert: (data: any) => this.handleInsert(table, data),
      update: (data: any) => this.handleUpdate(table, data),
      delete: () => this.handleDelete(table),
      eq: (column: string, value: any) => this.handleEq(column, value),
      single: () => this.handleSingle(),
      order: (column: string, options: any) => this.handleOrder(column, options),
      limit: (count: number) => this.handleLimit(count)
    };
  }

  auth = {
    signUp: async (credentials: any) => this.mockAuthResponse(),
    signInWithPassword: async (credentials: any) => this.mockAuthResponse(),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: (callback: any) => {
      // Mock auth state change
      setTimeout(() => callback('SIGNED_IN', { user: { id: 'mock-user', email: 'demo@example.com' } }), 1000);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  channel(name: string) {
    return {
      on: (event: string, config: any, callback: any) => {
        // Mock real-time updates with periodic data refresh
        const interval = setInterval(() => {
          const data = this.getStoredData();
          callback({ new: data, old: data });
        }, 5000);
        
        return {
          subscribe: () => ({
            unsubscribe: () => clearInterval(interval)
          })
        };
      }
    };
  }

  private getStoredData() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      // Initialize with mock data
      const initialData = {
        lobbies: [
          { id: '1', name: 'Zealot Hockey Lobby', game_type: 'zealot_hockey', player_count: 4, max_players: 8, status: 'active' },
          { id: '2', name: 'SC2 1v1 Queue', game_type: 'sc2_1v1', player_count: 2, max_players: 2, status: 'active' }
        ],
        players: [
          { id: '1', name: 'Player1', elo: 1500, matches_played: 10, wins: 6, losses: 4, win_rate: 60 },
          { id: '2', name: 'Player2', elo: 1450, matches_played: 8, wins: 4, losses: 4, win_rate: 50 }
        ],
        discord_users: [],
        activity_logs: []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(stored);
  }

  private setStoredData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private handleSelect(table: string, query: string) {
    const data = this.getStoredData();
    return {
      data: data[table] || [],
      error: null
    };
  }

  private handleInsert(table: string, data: any) {
    const stored = this.getStoredData();
    if (!stored[table]) stored[table] = [];
    
    const newItem = { ...data, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
    stored[table].push(newItem);
    this.setStoredData(stored);
    
    return { data: [newItem], error: null };
  }

  private handleUpdate(table: string, data: any) {
    const stored = this.getStoredData();
    if (stored[table]) {
      const index = stored[table].findIndex((item: any) => item.id === data.id);
      if (index !== -1) {
        stored[table][index] = { ...stored[table][index], ...data, updated_at: new Date().toISOString() };
        this.setStoredData(stored);
        return { data: [stored[table][index]], error: null };
      }
    }
    return { data: null, error: 'Not found' };
  }

  private handleDelete(table: string) {
    return {
      eq: (column: string, value: any) => ({
        then: (resolve: any) => {
          const stored = this.getStoredData();
          if (stored[table]) {
            stored[table] = stored[table].filter((item: any) => item[column] !== value);
            this.setStoredData(stored);
          }
          resolve({ data: null, error: null });
        }
      })
    };
  }

  private handleEq(column: string, value: any) {
    return {
      single: () => this.handleSingleWithFilter(column, value),
      then: (resolve: any) => {
        const stored = this.getStoredData();
        const data = stored[this.currentTable]?.filter((item: any) => item[column] === value) || [];
        resolve({ data, error: null });
      }
    };
  }

  private currentTable: string = '';

  private handleSingle() {
    return {
      then: (resolve: any) => {
        const stored = this.getStoredData();
        const data = stored[this.currentTable]?.[0] || null;
        resolve({ data, error: data ? null : 'Not found' });
      }
    };
  }

  private handleSingleWithFilter(column: string, value: any) {
    return {
      then: (resolve: any) => {
        const stored = this.getStoredData();
        const data = stored[this.currentTable]?.find((item: any) => item[column] === value) || null;
        resolve({ data, error: data ? null : 'Not found' });
      }
    };
  }

  private handleOrder(column: string, options: any) {
    return {
      limit: (count: number) => ({
        then: (resolve: any) => {
          const stored = this.getStoredData();
          let data = stored[this.currentTable] || [];
          
          // Simple sorting
          data = data.sort((a: any, b: any) => {
            if (options.ascending) {
              return a[column] > b[column] ? 1 : -1;
            } else {
              return a[column] < b[column] ? 1 : -1;
            }
          }).slice(0, count);
          
          resolve({ data, error: null });
        }
      })
    };
  }

  private handleLimit(count: number) {
    return {
      then: (resolve: any) => {
        const stored = this.getStoredData();
        const data = (stored[this.currentTable] || []).slice(0, count);
        resolve({ data, error: null });
      }
    };
  }

  private mockAuthResponse() {
    return {
      data: {
        user: { 
          id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
          email: 'demo@example.com'
        },
        session: { access_token: 'mock-token' }
      },
      error: null
    };
  }
}

// Database tables
export const TABLES = {
  LOBBIES: 'lobbies',
  PLAYERS: 'players',
  MATCHES: 'matches',
  DISCORD_USERS: 'discord_users',
  ACTIVITY_LOGS: 'activity_logs'
} as const;

// Create mock client instance
export const supabase = new MockSupabaseClient() as any;

// Mock real-time subscriptions
export const subscribeToLobbies = (callback: (payload: any) => void) => {
  const interval = setInterval(() => {
    const stored = JSON.parse(localStorage.getItem('tug-lobbies-data') || '{}');
    callback({ new: stored.lobbies || [], old: stored.lobbies || [] });
  }, 3000);
  
  return {
    unsubscribe: () => clearInterval(interval)
  };
};

export const subscribeToPlayers = (callback: (payload: any) => void) => {
  const interval = setInterval(() => {
    const stored = JSON.parse(localStorage.getItem('tug-lobbies-data') || '{}');
    callback({ new: stored.players || [], old: stored.players || [] });
  }, 3000);
  
  return {
    unsubscribe: () => clearInterval(interval)
  };
};