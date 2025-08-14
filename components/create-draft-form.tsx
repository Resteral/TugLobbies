"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createDraft } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-orange-600 hover:bg-orange-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Draft...
        </>
      ) : (
        "Create Draft Tournament"
      )}
    </Button>
  )
}

export default function CreateDraftForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction] = useActionState(createDraft, null)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  // Get tomorrow's date as minimum
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 16)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Draft
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Create New Draft Tournament</DialogTitle>
          <DialogDescription>Set up a new 4v4 draft tournament for captains to build their teams</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              Tournament Name *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Friday Night Draft Championship"
              required
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your tournament..."
              rows={3}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="maxTeams" className="block text-sm font-medium text-slate-300">
                Max Teams *
              </label>
              <Select name="maxTeams" required>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select max teams" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="4">4 Teams</SelectItem>
                  <SelectItem value="6">6 Teams</SelectItem>
                  <SelectItem value="8">8 Teams</SelectItem>
                  <SelectItem value="12">12 Teams</SelectItem>
                  <SelectItem value="16">16 Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="draftDate" className="block text-sm font-medium text-slate-300">
                Draft Date & Time *
              </label>
              <Input
                id="draftDate"
                name="draftDate"
                type="datetime-local"
                min={minDate}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
