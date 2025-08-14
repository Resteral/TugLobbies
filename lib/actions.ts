"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

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

  const email = formData.get("email")
  const password = formData.get("password")
  const playerName = formData.get("playerName")

  if (!email || !password || !playerName) {
    return { error: "Email, password, and player name are required" }
  }

  const supabase = createClient()

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard`,
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    // Create player profile
    if (authData.user) {
      const { error: profileError } = await supabase.from("players").insert({
        id: authData.user.id,
        name: playerName.toString(),
        elo_rating: 1000,
        wins: 0,
        losses: 0,
        games_played: 0,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
      }

      // Also create player_stats entry
      const { error: statsError } = await supabase.from("player_stats").insert({
        id: authData.user.id,
        player_name: playerName.toString(),
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

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
