"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { leaveLobby } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} variant="outline" className="w-full bg-transparent">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Leaving...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Leave Lobby
        </>
      )}
    </Button>
  )
}

interface LeaveLobbyButtonProps {
  lobbyId: string
  playerName: string
}

export default function LeaveLobbyButton({ lobbyId, playerName }: LeaveLobbyButtonProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(leaveLobby, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/lobbies")
    }
  }, [state, router])

  return (
    <form action={formAction}>
      <input type="hidden" name="lobbyId" value={lobbyId} />
      <input type="hidden" name="playerName" value={playerName} />
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm mb-3">
          {state.error}
        </div>
      )}
      <SubmitButton />
    </form>
  )
}
