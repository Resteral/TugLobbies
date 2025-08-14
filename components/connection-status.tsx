import { useRealTime } from "./real-time-provider"
import { Badge } from "./ui/badge"

export function ConnectionStatus() {
  const { isConnected } = useRealTime()

  return (
    <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
      {isConnected ? "Live" : "Offline"}
    </Badge>
  )
}
