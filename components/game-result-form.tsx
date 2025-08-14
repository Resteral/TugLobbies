"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { recordGameResult } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-orange-600 hover:bg-orange-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Recording Result...
        </>
      ) : (
        "Record Game Result"
      )}
    </Button>
  )
}

interface Props {
  game: any
  onClose: () => void
}

export default function GameResultForm({ game, onClose }: Props) {
  const router = useRouter()
  const [state, formAction] = useActionState(recordGameResult, null)

  useEffect(() => {
    if (state?.success) {
      onClose()
      router.refresh()
    }
  }, [state, onClose, router])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Record Game Result</DialogTitle>
          <DialogDescription>Enter the final scores for this game</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="gameId" value={game.id} />

          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {game.team1?.players?.display_name || game.team1?.name || "Team 1"} Score
              </label>
              <Input
                name="team1Score"
                type="number"
                min="0"
                max="20"
                required
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {game.team2?.players?.display_name || game.team2?.name || "Team 2"} Score
              </label>
              <Input
                name="team2Score"
                type="number"
                min="0"
                max="20"
                required
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded text-sm">
            <p className="font-semibold mb-1">Note:</p>
            <ul className="text-xs space-y-1">
              <li>• Games cannot end in a tie</li>
              <li>• ELO ratings will be automatically updated</li>
              <li>• Winner will advance to the next round</li>
            </ul>
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
