import React from "react"
import cn from "classnames";

const Button = React.forwardRef(function Button({ className, size = "md", variant = "default", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
        {
          sm: "h-8 px-3 text-sm",
          md: "h-10 px-4 text-base",
          lg: "h-12 px-6 text-lg",
        }[size],
        {
          default: "bg-primary text-white hover:bg-primary/90",
          outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        }[variant],
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }