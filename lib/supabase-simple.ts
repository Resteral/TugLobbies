// Simple Supabase client using fetch API instead of packages
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function signInWithPassword(email: string, password: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error_description || "Authentication failed")
  }

  return data
}

export async function signUp(email: string, password: string, userData: any) {
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({
      email,
      password,
      data: userData,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error_description || "Sign up failed")
  }

  return data
}

export async function createPlayer(playerData: any, accessToken: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/players`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(playerData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create player")
  }

  return response.json()
}
