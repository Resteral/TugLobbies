"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const username = formData.get("username")
  const password = formData.get("password")

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    const email = `${username}@zealothockey.com`

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password.toString(),
    })

    if (error) {
      if (error.message.toLowerCase().includes("email") || error.message.toLowerCase().includes("invalid")) {
        return { error: "Invalid username or password" }
      }
      return { error: error.message }
    }

    redirect("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const username = formData.get("username")
  const password = formData.get("password")
  const starcraftId = formData.get("starcraftId")

  if (!username || !password || !starcraftId) {
    return { error: "Username, password, and StarCraft Account ID are required" }
  }

  const usernameStr = username.toString()

  if (usernameStr.length < 3 || usernameStr.length > 20) {
    return { error: "Username must be between 3 and 20 characters long." }
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(usernameStr)) {
    return {
      error:
        "Username can only contain letters, numbers, underscores (_), and hyphens (-). No spaces or special characters allowed.",
    }
  }

  const starcraftIdStr = starcraftId.toString()
  const starcraftIdRegex = /^[0-9]{6,14}$/
  if (!starcraftIdRegex.test(starcraftIdStr)) {
    return { error: "StarCraft Account ID must be 6-14 digits only." }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    const email = `${username}@zealothockey.com`

    const { data: existingPlayer } = await supabase
      .from("players")
      .select("name")
      .ilike("name", username.toString())
      .single()

    if (existingPlayer) {
      return { error: "Username already taken. Please choose a different username." }
    }

    const { data: existingStarcraftId } = await supabase
      .from("players")
      .select("starcraft_account_id")
      .eq("starcraft_account_id", starcraftId.toString())
      .single()

    if (existingStarcraftId) {
      return { error: "StarCraft Account ID already registered. Please use a different Account ID." }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard`,
      },
    })

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return { error: "An account with this username already exists." }
      }
      if (authError.message.includes("Password")) {
        return { error: "Password must be at least 6 characters long." }
      }
      return { error: "Failed to create account. Please try again." }
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("players").insert({
        id: authData.user.id,
        name: username.toString(),
        starcraft_account_id: starcraftId.toString(),
        elo_rating: 1000,
        wins: 0,
        losses: 0,
        games_played: 0,
        verified: false,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: "Failed to create player profile. Please try again." }
      }

      const { error: statsError } = await supabase.from("player_stats").insert({
        id: authData.user.id,
        player_name: username.toString(),
        elo: 1000,
        wins: 0,
        losses: 0,
        total_games: 0,
        win_rate: 0,
        rank: "Rookie",
      })

      if (statsError) {
        console.error("Stats creation error:", statsError)
      }
    }

    return { success: "Account created successfully! You can now sign in." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function grantVerification(prevState: any, formData: FormData) {
  const playerName = formData.get("playerName")
  const adminKey = formData.get("adminKey")

  if (!playerName || !adminKey) {
    return { error: "Player name and admin key are required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    const { data, error } = await supabase.rpc("grant_verification", {
      player_name: playerName.toString(),
      admin_key: adminKey.toString(),
    })

    if (error) {
      return { error: "Failed to grant verification" }
    }

    if (!data) {
      return { error: "Invalid admin key or player not found" }
    }

    return { success: `Verification granted to ${playerName}` }
  } catch (error) {
    console.error("Grant verification error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function revokeVerification(prevState: any, formData: FormData) {
  const playerName = formData.get("playerName")
  const adminKey = formData.get("adminKey")

  if (!playerName || !adminKey) {
    return { error: "Player name and admin key are required" }
  }

  const supabase = createServerActionClient({ cookies })

  try {
    const { data, error } = await supabase.rpc("revoke_verification", {
      player_name: playerName.toString(),
      admin_key: adminKey.toString(),
    })

    if (error) {
      return { error: "Failed to revoke verification" }
    }

    if (!data) {
      return { error: "Invalid admin key or player not found" }
    }

    return { success: `Verification revoked from ${playerName}` }
  } catch (error) {
    console.error("Revoke verification error:", error)
    return { error: "An unexpected error occurred" }
  }
}
