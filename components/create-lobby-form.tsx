"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { createLobby } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        "Create Lobby"
      )}
    </Button>
  )
}

interface CreateLobbyFormProps {
  playerName: string
}

export default function CreateLobbyForm({ playerName }: CreateLobbyFormProps) {
  const [open, setOpen] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [lobbyType, setLobbyType] = useState("draft")
  const router = useRouter()
  const [state, formAction] = useActionState(createLobby, null)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Lobby
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New Lobby</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
          )}

          <input type="hidden" name="hostName" value={playerName} />
          <input type="hidden" name="isPrivate" value={isPrivate.toString()} />
          <input type="hidden" name="lobbyType" value={lobbyType} />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lobbyName">Lobby Name</Label>
              <Input
                id="lobbyName"
                name="lobbyName"
                placeholder="Enter lobby name"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Max Players (2-8)</Label>
              <Select name="maxPlayers" defaultValue="8">
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Players
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lobby Type</Label>
              <Select value={lobbyType} onValueChange={setLobbyType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="draft">Draft Mode</SelectItem>
                  <SelectItem value="auction">Auction Draft</SelectItem>
                  <SelectItem value="quick">Quick Match</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="private">Private Lobby</Label>
            </div>
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
