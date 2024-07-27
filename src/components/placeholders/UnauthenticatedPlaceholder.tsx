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

import { LockClosedIcon } from "@heroicons/react/24/solid"

import SigninButton from "@/components/user/SigninButton"
import { cn } from "@/utils/classnames"

const UnauthenticatedPlaceholder = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-col items-center rounded-lg p-8", className)} {...props}>
      <LockClosedIcon width={48} height={48} className="mb-4 text-gray-500" />
      <h2>Not signed in</h2>
      <p className="text-gray-500">You must sign in to view this content</p>
      <div className="mt-6">
        <SigninButton>Sign in</SigninButton>
      </div>
    </div>
  )
}

export default UnauthenticatedPlaceholder
