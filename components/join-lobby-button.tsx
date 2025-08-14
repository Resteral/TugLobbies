"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Users, Loader2 } from "lucide-react"
import { joinLobby } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-green-600 hover:bg-green-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Joining...
        </>
      ) : (
        <>
          <Users className="mr-2 h-4 w-4" />
          Join Lobby
        </>
      )}
    </Button>
  )
}

interface JoinLobbyButtonProps {
  lobbyId: string
  playerName: string
}

export default function JoinLobbyButton({ lobbyId, playerName }: JoinLobbyButtonProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(joinLobby, null)

  useEffect(() => {
    if (state?.success) {
      router.refresh()
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
