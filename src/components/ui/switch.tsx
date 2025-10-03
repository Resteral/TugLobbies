import * as React from "react"

import { cn } from "../../lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-transparent bg-slate-600 transition-colors duration-200 ease-in-out",
          "checked:bg-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
          "before:inline-block before:h-5 before:w-5 before:translate-x-0 before:rounded-full before:bg-white before:shadow-lg before:transition-transform before:duration-200 before:ease-in-out",
          "checked:before:translate-x-5",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    )
  }
)
Switch.displayName = "Switch"

export { Switch }