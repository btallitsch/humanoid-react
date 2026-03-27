import React from "react"
import clsx from "clsx"

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200",
        className
      )}
      {...props}
    />
  )
}
