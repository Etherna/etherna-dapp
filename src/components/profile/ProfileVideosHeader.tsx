/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import React from "react"

import { Button } from "@/components/ui/actions"
import { cn } from "@/utils/classnames"

const ProfileVideosHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col items-start gap-8", className)} {...props}>
        {children}
      </div>
    )
  }
)

const ProfileVideosHeaderBack = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Button>
>(({ children, className, color = "inverted", rounded = false, small = true, ...props }) => {
  return (
    <Button className={cn("", className)} color={color} rounded={rounded} small={small} {...props}>
      {children ?? "← Back to channel"}
    </Button>
  )
})

const ProfileVideosHeaderContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full flex-col gap-x-2 gap-y-4 rounded-lg bg-white p-3 dark:bg-gray-800 sm:flex-row sm:items-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const ProfileVideosHeaderSection = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { variant?: "fill" | "fit" }
>(({ children, className, variant = "fill", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-1",
        {
          "flex-1": variant === "fill",
          "shrink-0": variant === "fit",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

const ProfileVideosHeaderTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<"h2">>(
  ({ children, className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn("flex items-center text-lg/none font-semibold", className)}
        {...props}
      >
        {children}
      </h2>
    )
  }
)

const ProfileVideosHeaderDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<"p">>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("text-sm opacity-50", className)} {...props}>
        {children}
      </p>
    )
  }
)

export {
  ProfileVideosHeader,
  ProfileVideosHeaderBack,
  ProfileVideosHeaderContent,
  ProfileVideosHeaderSection,
  ProfileVideosHeaderTitle,
  ProfileVideosHeaderDescription,
}
