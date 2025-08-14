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
import { createAuctionLeague } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-green-600 hover:bg-green-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating League...
        </>
      ) : (
        "Create Auction League"
      )}
    </Button>
  )
}

export default function CreateAuctionLeagueForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction] = useActionState(createAuctionLeague, null)

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

  // Get next week for season start
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const minSeasonDate = nextWeek.toISOString().slice(0, 10)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Auction League
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Auction League</DialogTitle>
          <DialogDescription>Set up a new auction-style league where teams bid on players</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              League Name *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Spring Auction League 2025"
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
              placeholder="Describe your auction league..."
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
                  <SelectItem value="6">6 Teams</SelectItem>
                  <SelectItem value="8">8 Teams</SelectItem>
                  <SelectItem value="10">10 Teams</SelectItem>
                  <SelectItem value="12">12 Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="budgetCap" className="block text-sm font-medium text-slate-300">
                Budget Cap *
              </label>
              <Select name="budgetCap" required>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="500">$500</SelectItem>
                  <SelectItem value="750">$750</SelectItem>
                  <SelectItem value="1000">$1,000</SelectItem>
                  <SelectItem value="1500">$1,500</SelectItem>
                  <SelectItem value="2000">$2,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="draftDate" className="block text-sm font-medium text-slate-300">
              Auction Date & Time *
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="seasonStart" className="block text-sm font-medium text-slate-300">
                Season Start Date
              </label>
              <Input
                id="seasonStart"
                name="seasonStart"
                type="date"
                min={minSeasonDate}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="seasonEnd" className="block text-sm font-medium text-slate-300">
                Season End Date
              </label>
              <Input
                id="seasonEnd"
                name="seasonEnd"
                type="date"
                min={minSeasonDate}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded text-sm">
            <h4 className="font-semibold mb-1">Auction League Features:</h4>
            <ul className="text-xs space-y-1">
              <li>• Teams bid on players from a shared player pool</li>
              <li>• Each team has a budget cap to manage</li>
              <li>• Higher ELO players have higher base prices</li>
              <li>• Season games scheduled after auction completes</li>
            </ul>
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
