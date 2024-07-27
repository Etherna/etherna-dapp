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

import { Skeleton } from "@/components/ui/display"
import { cn } from "@/utils/classnames"

const PlaylistPreviewPlaceholder = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div className={cn("w-full space-y-0.5", className)} {...props}>
      <Skeleton className="mx-4 block h-1 rounded-none rounded-t" />
      <Skeleton className="mx-2 block h-1.5 rounded-none rounded-t" />
      <Skeleton className="block h-40 rounded-md" />
    </div>
  )
}

export default PlaylistPreviewPlaceholder
