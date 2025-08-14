"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { joinAuctionLeague } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-green-600 hover:bg-green-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Registering...
        </>
      ) : (
        <>
          <DollarSign className="mr-2 h-4 w-4" />
          Register Team
        </>
      )}
    </Button>
  )
}

interface Props {
  leagueId: string
}

export default function RegisterForAuctionForm({ leagueId }: Props) {
  const router = useRouter()
  const [state, formAction] = useActionState(joinAuctionLeague, null)

  useEffect(() => {
    if (state?.success) {
      router.push(`/leagues/${leagueId}`)
    }
  }, [state, router, leagueId])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="leagueId" value={leagueId} />

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="teamName" className="block text-sm font-medium text-slate-300">
          Team Name *
        </label>
        <Input
          id="teamName"
          name="teamName"
          type="text"
          placeholder="Enter your team name"
          required
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
        <p className="text-xs text-slate-500">Choose a unique name for your auction team</p>
      </div>

      <SubmitButton />
    </form>
  )
}
