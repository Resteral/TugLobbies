"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { joinDraft } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Registering...
        </>
      ) : (
        <>
          <Users className="mr-2 h-4 w-4" />
          Register as Captain
        </>
      )}
    </Button>
  )
}

interface Props {
  tournamentId: string
}

export default function RegisterForDraftForm({ tournamentId }: Props) {
  const router = useRouter()
  const [state, formAction] = useActionState(joinDraft, null)

  useEffect(() => {
    if (state?.success) {
      router.push(`/draft/${tournamentId}`)
    }
  }, [state, router, tournamentId])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tournamentId" value={tournamentId} />

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
      )}

      <SubmitButton />
    </form>
  )
}
