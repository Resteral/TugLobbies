"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Trophy } from "lucide-react"
import { createTournament } from "@/lib/tournament-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Tournament...
        </>
      ) : (
        <>
          <Trophy className="mr-2 h-4 w-4" />
          Create Tournament
        </>
      )}
    </Button>
  )
}

export default function CreateTournamentForm() {
  const [state, formAction] = useActionState(createTournament, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">
          Tournament Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter tournament name"
          required
          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type" className="text-gray-300">
          Tournament Type
        </Label>
        <Select name="type" required>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select tournament type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            <SelectItem value="single_elimination">Single Elimination</SelectItem>
            <SelectItem value="double_elimination">Double Elimination</SelectItem>
            <SelectItem value="round_robin">Round Robin</SelectItem>
            <SelectItem value="swiss">Swiss System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxTeams" className="text-gray-300">
            Max Teams
          </Label>
          <Select name="maxTeams" defaultValue="16">
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="4">4 Teams</SelectItem>
              <SelectItem value="8">8 Teams</SelectItem>
              <SelectItem value="16">16 Teams</SelectItem>
              <SelectItem value="32">32 Teams</SelectItem>
              <SelectItem value="64">64 Teams</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationType" className="text-gray-300">
            Registration
          </Label>
          <Select name="registrationType" defaultValue="open">
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="open">Open Registration</SelectItem>
              <SelectItem value="invite_only">Invite Only</SelectItem>
              <SelectItem value="qualification">Qualification Required</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entryFee" className="text-gray-300">
            Entry Fee ($)
          </Label>
          <Input
            id="entryFee"
            name="entryFee"
            type="number"
            min="0"
            placeholder="0"
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prizePool" className="text-gray-300">
            Prize Pool ($)
          </Label>
          <Input
            id="prizePool"
            name="prizePool"
            type="number"
            min="0"
            placeholder="0"
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}
