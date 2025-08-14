"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signUpUser } from "@/lib/auth-actions"

export function SimpleSignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")

    const result = await signUpUser(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-blue-600">Create Account</CardTitle>
        <CardDescription>Join Zealot Hockey and start competing!</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              required
              pattern="[a-zA-Z0-9_-]{3,20}"
              title="3-20 characters, letters, numbers, underscore, and hyphen only"
              onInput={(e) => {
                const target = e.target as HTMLInputElement
                target.value = target.value.replace(/[^a-zA-Z0-9_-]/g, "")
              }}
            />
            <p className="text-xs text-gray-600">3-20 characters, letters, numbers, underscore, and hyphen only</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="starcraftId">StarCraft Account ID</Label>
            <Input
              id="starcraftId"
              name="starcraftId"
              type="text"
              placeholder="123456789"
              required
              pattern="\d{6,14}"
              title="6-14 digit numeric Account ID"
              onInput={(e) => {
                const target = e.target as HTMLInputElement
                target.value = target.value.replace(/[^0-9]/g, "")
              }}
            />
            <p className="text-xs text-gray-600">
              Find your Account ID: Battle.net → Account Settings → Account Details
            </p>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
