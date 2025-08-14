import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions"
import Link from "next/link"
import { Trophy, Users, Calendar, Target, LogOut, User, DollarSign, Home, Gamepad2 } from "lucide-react"
import { ConnectionStatus } from "@/components/connection-status"

export async function Navigation() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get player profile if user exists
  let player = null
  if (user) {
    const { data } = await supabase.from("players").select("*").eq("user_id", user.id).single()
    player = data
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-white">Zealot Hockey</span>
              <ConnectionStatus />
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {user && (
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              <Link
                href="/leaderboard"
                className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
              >
                <Target className="h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
              <Link
                href="/draft"
                className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Draft</span>
              </Link>
              <Link
                href="/tournaments"
                className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Tournaments</span>
              </Link>
              <Link
                href="/leagues"
                className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                <span>Leagues</span>
              </Link>
              <Link
                href="/games"
                className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Games</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && player ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{player.display_name}</span>
                  <span className="text-orange-500 font-semibold">{player.elo_rating}</span>
                </Link>
                <form action={signOut}>
                  <Button type="submit" variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : user ? (
              <Link href="/profile/setup">
                <Button variant="outline" size="sm">
                  Setup Profile
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button variant="outline" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
