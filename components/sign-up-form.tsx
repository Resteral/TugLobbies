"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trophy } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing up...
        </>
      ) : (
        "Sign Up"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <Card className="w-full max-w-md bg-slate-900 border-slate-800">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <Trophy className="h-12 w-12 text-orange-500" />
        </div>
        <CardTitle className="text-3xl font-bold text-white">Join Zealot Hockey</CardTitle>
        <CardDescription className="text-slate-400">Create your account to start competing</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
          )}

          {state?.success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded">
              {state.success}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <SubmitButton />

          <div className="text-center text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
