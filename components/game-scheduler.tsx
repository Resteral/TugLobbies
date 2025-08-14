"use client"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { scheduleGame } from "@/lib/actions"

function ScheduleButton({ gameId }: { gameId: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} size="sm" className="bg-blue-600 hover:bg-blue-700">
      {pending ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Scheduling...
        </>
      ) : (
        <>
          <Calendar className="mr-1 h-3 w-3" />
          Schedule
        </>
      )}
    </Button>
  )
}

interface Props {
  games: any[]
}

export default function GameScheduler({ games }: Props) {
  const router = useRouter()
  const [state, formAction] = useActionState(scheduleGame, null)

  useEffect(() => {
    if (state?.success) {
      router.refresh()
    }
  }, [state, router])

  // Get tomorrow as minimum date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDateTime = tomorrow.toISOString().slice(0, 16)

  const unscheduledGames = games.filter((game) => !game.scheduled_at && game.status === "scheduled")
  const scheduledGames = games.filter((game) => game.scheduled_at)

  return (
    <div className="space-y-6">
      {/* Unscheduled Games */}
      {unscheduledGames.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Games Needing Schedule</h3>
          <div className="grid gap-4">
            {unscheduledGames.map((game) => (
              <Card key={game.id} className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-white font-semibold">
                        {game.team1?.players?.display_name || game.team1?.name || "TBD"} vs{" "}
                        {game.team2?.players?.display_name || game.team2?.name || "TBD"}
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Needs Scheduling</Badge>
                    </div>

                    <form action={formAction} className="flex items-center space-x-2">
                      <input type="hidden" name="gameId" value={game.id} />
                      <Input
                        name="scheduledAt"
                        type="datetime-local"
                        min={minDateTime}
                        required
                        className="bg-slate-800 border-slate-700 text-white w-48"
                      />
                      <ScheduleButton gameId={game.id} />
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Games */}
      {scheduledGames.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Scheduled Games</h3>
          <div className="grid gap-4">
            {scheduledGames
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .map((game) => (
                <Card key={game.id} className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-white font-semibold">
                          {game.team1?.players?.display_name || game.team1?.name || "TBD"} vs{" "}
                          {game.team2?.players?.display_name || game.team2?.name || "TBD"}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              game.status === "completed"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : game.status === "live"
                                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            }
                          >
                            {game.status === "completed" ? "Completed" : game.status === "live" ? "Live" : "Scheduled"}
                          </Badge>
                          {game.status === "completed" && (
                            <span className="text-slate-400 text-sm">
                              {game.team1_score} - {game.team2_score}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(game.scheduled_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
      )}
    </div>
  )
}
