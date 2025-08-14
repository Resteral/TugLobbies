import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileSetupForm from "@/components/profile-setup-form"

export default async function ProfileSetupPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if player profile already exists
  const { data: existingPlayer } = await supabase.from("players").select("id").eq("user_id", user.id).single()

  if (existingPlayer) {
    redirect("/profile")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Setup Your Player Profile</h1>
        <p className="text-slate-400">Complete your profile to start competing in the league</p>
      </div>
      <ProfileSetupForm />
    </div>
  )
}
