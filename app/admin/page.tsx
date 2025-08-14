import { grantVerification, revokeVerification } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Grant Verification</CardTitle>
            <CardDescription>Grant verified status to a player</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={grantVerification} className="space-y-4">
              <div>
                <Label htmlFor="grantPlayerName">Player Name</Label>
                <Input id="grantPlayerName" name="playerName" placeholder="Enter player name" required />
              </div>
              <div>
                <Label htmlFor="grantAdminKey">Admin Key</Label>
                <Input id="grantAdminKey" name="adminKey" type="password" placeholder="Enter admin key" required />
              </div>
              <Button type="submit" className="w-full">
                Grant Verification
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revoke Verification</CardTitle>
            <CardDescription>Remove verified status from a player</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={revokeVerification} className="space-y-4">
              <div>
                <Label htmlFor="revokePlayerName">Player Name</Label>
                <Input id="revokePlayerName" name="playerName" placeholder="Enter player name" required />
              </div>
              <div>
                <Label htmlFor="revokeAdminKey">Admin Key</Label>
                <Input id="revokeAdminKey" name="adminKey" type="password" placeholder="Enter admin key" required />
              </div>
              <Button type="submit" variant="destructive" className="w-full">
                Revoke Verification
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
