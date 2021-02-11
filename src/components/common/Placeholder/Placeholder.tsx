import React from "react"
import classnames from "classnames"

import "./placeholder.scss"

type PlaceholderProps = {
  width?: string
  height?: string
  ratio?: number
  round?: "" | "xs" | "sm" | "default" | "md" | "lg" | "xl" | "2xl" | "full" | "none" | boolean
  className?: string
}

const Placeholder = ({
  width = "100%",
  height = "2rem",
  ratio,
  round,
  className
}: PlaceholderProps) => {
  return (
    <div
      className={classnames("placeholder", className, {
        "rounded": round === "default" || round === true,
        "rounded-none": round === "none",
        "rounded-xs": round === "xs",
        "rounded-sm": round === "sm",
        "rounded-md": round === "md",
        "rounded-lg": round === "lg",
        "rounded-xl": round === "xl",
        "rounded-2xl": round === "2xl",
        "rounded-full": round === "full",
      })}
      style={{
        width,
        height: ratio ? "" : height,
        paddingTop: ratio ? `calc(${width} * ${ratio})` : ""
      }}
    />
  )
}

export default Placeholder
