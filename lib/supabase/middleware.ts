import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Get the session token from cookies
  const token = request.cookies.get("sb-access-token")?.value

  let user = null
  if (token) {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser(token)
      user = authUser
    } catch (error) {
      // Token is invalid, continue without user
    }
  }

  // Protected routes - redirect to login if not authenticated
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up") ||
    request.nextUrl.pathname === "/auth/callback" ||
    request.nextUrl.pathname === "/"

  // Protected routes that require authentication
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/lobby") ||
    request.nextUrl.pathname.startsWith("/game") ||
    request.nextUrl.pathname.startsWith("/tournament") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/leaderboard")

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
