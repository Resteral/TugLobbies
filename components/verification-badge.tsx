import { CheckCircle } from "lucide-react"

interface VerificationBadgeProps {
  verified: boolean
  size?: "sm" | "md" | "lg"
}

export function VerificationBadge({ verified, size = "md" }: VerificationBadgeProps) {
  if (!verified) return null

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return <CheckCircle className={`${sizeClasses[size]} text-blue-500 fill-current`} title="Verified Player" />
}
