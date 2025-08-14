"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createPlayerProfile } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Profile...
        </>
      ) : (
        "Create Profile"
      )}
    </Button>
  )
}

export default function ProfileSetupForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(createPlayerProfile, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/profile")
    }
  }, [state, router])

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Player Information</CardTitle>
        <CardDescription>This information will be visible to other players in the league</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-slate-300">
                Username *
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="zealot_player"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Must be unique, no spaces allowed</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-300">
                Display Name *
              </label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Alex Johnson"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="position" className="block text-sm font-medium text-slate-300">
              Primary Position *
            </label>
            <Select name="position" required>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select your position" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="Forward">Forward</SelectItem>
                <SelectItem value="Defense">Defense</SelectItem>
                <SelectItem value="Goalie">Goalie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-medium text-slate-300">
              Bio (Optional)
            </label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell other players about your hockey experience..."
              rows={3}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
