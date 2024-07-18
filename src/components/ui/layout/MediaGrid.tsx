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

import { cn } from "@/utils/classnames"

type MediaGridProps = React.ComponentProps<"div"> & {
  variant?: "default" | "single-col"
  size?: "default" | "sm"
}

const MediaGrid = React.forwardRef<HTMLDivElement, MediaGridProps>(
  ({ children, className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <div
        className={cn(
          "mx-auto grid max-w-[2560px] grid-flow-row-dense gap-4",
          variant === "single-col"
            ? {
                "sm:gap-6": true,
                "grid-cols-1 grid-rows-[repeat(auto-fill,minmax(150px,1fr))]": true,
                "mx-auto max-w-screen-lg": true,
              }
            : {
                "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]": size === "sm",
                "lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]": size === "sm",
                "xl:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]": size === "sm",
                "grid-cols-[repeat(auto-fill,minmax(180px,1fr))]": size === "default",
                "lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]": size === "default",
                "xl:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]": size === "default",
              }
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MediaGrid.displayName = "MediaGrid"

export default MediaGrid
