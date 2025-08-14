"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { updatePlayerProfile } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        "Update Profile"
      )}
    </Button>
  )
}

interface ProfileFormProps {
  player: {
    name: string
    starcraft_account_id: string
    elo_rating: number
    wins: number
    losses: number
    games_played: number
    verified: boolean
  }
}

export default function ProfileForm({ player }: ProfileFormProps) {
  const [state, formAction] = useActionState(updatePlayerProfile, null)

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mr-4 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h2 className="text-xl font-semibold">Edit Profile</h2>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
        )}

        {state?.success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded">
            {state.success}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-300">
              Player Name
            </label>
            <Input
              id="playerName"
              name="playerName"
              type="text"
              defaultValue={player.name}
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-300">
              Account ID (6-14 digits)
            </label>
            <Input
              id="accountId"
              name="accountId"
              type="text"
              defaultValue={player.starcraft_account_id}
              pattern="[0-9]{6,14}"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">ELO Rating</label>
              <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-400">
                {player.elo_rating}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Games Played</label>
              <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-400">
                {player.games_played}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Wins</label>
              <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-green-400">
                {player.wins}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Losses</label>
              <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-red-400">
                {player.losses}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Account Status</label>
            <div
              className={`bg-gray-700 border border-gray-600 rounded-md px-3 py-2 ${player.verified ? "text-green-400" : "text-yellow-400"}`}
            >
              {player.verified ? "Verified" : "Unverified"}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <SubmitButton />
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
