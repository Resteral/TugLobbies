import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateTournamentForm from "@/components/create-tournament-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function CreateTournamentPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/tournaments"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Link>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Create Tournament</h1>
          <CreateTournamentForm />
        </div>
      </div>
    </div>
  )
}
