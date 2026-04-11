import React from "react"
import { cn } from "@/lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "theme-input w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
export default Input
