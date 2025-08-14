"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, HopIcon as Hockey, ExternalLink } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

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
          Creating account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-600 rounded-full">
            <Hockey className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Join Zealot Hockey</h1>
        <p className="text-lg text-gray-400">Create your player account</p>
      </div>

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
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Your unique username"
              pattern="[a-zA-Z0-9_-]{3,20}"
              minLength={3}
              maxLength={20}
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z0-9_-]/g, "")
              }}
            />
            <p className="text-xs text-gray-500">3-20 characters, letters, numbers, underscore, and hyphen only</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="starcraftId" className="block text-sm font-medium text-gray-300">
              StarCraft Account ID
            </label>
            <Input
              id="starcraftId"
              name="starcraftId"
              type="text"
              placeholder="123456789012"
              pattern="[0-9]{6,14}"
              minLength={6}
              maxLength={14}
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              onInput={(e) => {
                // Only allow numbers
                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "")
              }}
            />
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-300 mb-1">How to find your StarCraft Account ID:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Open StarCraft II</li>
                    <li>Go to your Profile (top right corner)</li>
                    <li>Look for your numeric Account ID (6-14 digits)</li>
                    <li>Enter only the numbers (no letters or symbols)</li>
                  </ol>
                  <p className="text-xs text-gray-500 mt-2">Must be 6-14 digits long</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <SubmitButton />

        <div className="text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
