"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { signInWithPassword, signUp, createPlayer } from "./supabase-simple"

export async function signIn(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  if (!usernameRegex.test(username)) {
    return {
      error:
        "Username contains invalid characters. Please use only letters, numbers, underscores, and hyphens (3-20 characters).",
    }
  }

  try {
    // Convert username to email format for Supabase
    const email = `${username}@zealothockey.com`

    const { access_token, user } = await signInWithPassword(email, password)

    // Set authentication cookie
    cookies().set("supabase-auth-token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    cookies().set("user-id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    cookies().set("username", username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { error: "Invalid username or password" }
  }

  redirect("/dashboard")
}

export async function signUpUser(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const starcraftId = formData.get("starcraftId") as string

  if (!username || !password || !starcraftId) {
    return { error: "All fields are required" }
  }

  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  if (!usernameRegex.test(username)) {
    return {
      error:
        "Username contains invalid characters. Please use only letters, numbers, underscores, and hyphens (3-20 characters).",
    }
  }

  // Validate StarCraft Account ID format (6-14 digits)
  const starcraftIdRegex = /^\d{6,14}$/
  if (!starcraftIdRegex.test(starcraftId)) {
    return { error: "StarCraft Account ID must be 6-14 digits" }
  }

  try {
    // Convert username to email format for Supabase
    const email = `${username}@zealothockey.com`

    const { access_token, user } = await signUp(email, password, {
      username,
      starcraft_account_id: starcraftId,
    })

    // Create player record
    await createPlayer(
      {
        id: user.id,
        name: username,
        starcraft_account_id: starcraftId,
        elo_rating: 1000,
        wins: 0,
        losses: 0,
        verified: false,
      },
      access_token,
    )

    // Set authentication cookies
    cookies().set("supabase-auth-token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    cookies().set("user-id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    cookies().set("username", username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  } catch (error: any) {
    console.error("Sign up error:", error)
    if (error.message.includes("already registered")) {
      return { error: "Username already exists. Please choose a different username." }
    }
    return { error: "Failed to create account. Please try again." }
  }

  redirect("/dashboard")
}

export async function signOut() {
  cookies().delete("supabase-auth-token")
  cookies().delete("user-id")
  cookies().delete("username")
  redirect("/")
}
