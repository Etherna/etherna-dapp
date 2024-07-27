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

const ProfileSource = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("rounded-lg bg-white p-4 dark:bg-gray-800", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const ProfileSourceHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-x-2 gap-y-4 sm:flex-row", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const ProfileSourceHeaderSection = React.forwardRef<
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

const ProfileSourceTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<"h3">>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("flex items-center text-md/none font-semibold", className)}
        {...props}
      >
        {children}
      </h3>
    )
  }
)

const ProfileSourceDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<"p">>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("text-sm opacity-50", className)} {...props}>
        {children}
      </p>
    )
  }
)

const ProfileSourceContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mt-4", className)} {...props}>
        {children}
      </div>
    )
  }
)

const ProfileSourceEmptyMessage = React.forwardRef<HTMLDivElement, React.ComponentProps<"p">>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("text-center text-sm opacity-50", className)} {...props}>
        {children ?? "No videos found"}
      </p>
    )
  }
)

const ProfileSourceFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mt-4 flex flex-col", className)} {...props}>
        {children}
      </div>
    )
  }
)

const ProfileSourceLoadMore = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Button>>(
  ({ children, className, color = "transparent", small = true, rounded = true, ...props }) => {
    return (
      <Button
        className={cn("mx-auto", className)}
        color={color}
        rounded={rounded}
        small={small}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

export {
  ProfileSource,
  ProfileSourceHeader,
  ProfileSourceHeaderSection,
  ProfileSourceTitle,
  ProfileSourceDescription,
  ProfileSourceContent,
  ProfileSourceEmptyMessage,
  ProfileSourceFooter,
  ProfileSourceLoadMore,
}
