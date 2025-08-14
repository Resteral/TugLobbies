"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Lock } from "lucide-react"
import { createLobby } from "@/lib/lobby-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Lobby...
        </>
      ) : (
        "Create Lobby"
      )}
    </Button>
  )
}

export default function CreateLobbyForm() {
  const [state, formAction] = useActionState(createLobby, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">
          Lobby Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter lobby name"
          required
          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lobbyType" className="text-gray-300">
          Game Type
        </Label>
        <Select name="lobbyType" required>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select game type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            <SelectItem value="4v4_draft">4v4 Draft</SelectItem>
            <SelectItem value="3v3_casual">3v3 Casual</SelectItem>
            <SelectItem value="2v2_ranked">2v2 Ranked</SelectItem>
            <SelectItem value="tournament">Tournament</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxPlayers" className="text-gray-300">
          Max Players
        </Label>
        <Select name="maxPlayers" defaultValue="8">
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            <SelectItem value="2">2 Players</SelectItem>
            <SelectItem value="4">4 Players</SelectItem>
            <SelectItem value="6">6 Players</SelectItem>
            <SelectItem value="8">8 Players</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="isPrivate" name="isPrivate" className="border-gray-600" />
        <Label htmlFor="isPrivate" className="text-gray-300 flex items-center space-x-2">
          <Lock className="h-4 w-4" />
          <span>Private Lobby</span>
        </Label>
      </div>

      <SubmitButton />
    </form>
  )
}
