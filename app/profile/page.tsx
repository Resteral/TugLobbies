import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileEditor from "@/components/profile-editor"

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: player } = await supabase.from("players").select("*").eq("id", user.id).single()

  if (!player) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Player Profile</h1>
        <ProfileEditor player={player} />
      </div>
    </div>
  )
}
