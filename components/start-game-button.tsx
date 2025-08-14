"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Play, Loader2 } from "lucide-react"
import { startGame } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          Start Game
        </>
      )}
    </Button>
  )
}

interface StartGameButtonProps {
  lobbyId: string
  playerCount: number
  minPlayers: number
}

export default function StartGameButton({ lobbyId, playerCount, minPlayers }: StartGameButtonProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(startGame, null)
  const canStart = playerCount >= minPlayers

  useEffect(() => {
    if (state?.success) {
      router.push(`/game/${lobbyId}`)
    }
  }, [state, router, lobbyId])

  return (
    <form action={formAction}>
      <input type="hidden" name="lobbyId" value={lobbyId} />
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm mb-3">
          {state.error}
        </div>
      )}
      {!canStart && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-3 py-2 rounded text-sm mb-3">
          Need at least {minPlayers} players to start
        </div>
      )}
      <SubmitButton disabled={!canStart} />
    </form>
  )
}
