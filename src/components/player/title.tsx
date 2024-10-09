import React from "react"
import { ChapterTitle, useChapterTitle } from "@vidstack/react"

import { cn } from "@/utils/classnames"

export function Title({ className, ...props }: React.ComponentProps<"span">) {
  const title = useChapterTitle()

  if (!title) {
    return null
  }

  return (
    <span
      className={cn(
        "inline-block flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-sm font-medium text-white/70",
        className
      )}
      {...props}
    >
      <span className="mr-1">·</span>
      <ChapterTitle />
    </span>
  )
}
