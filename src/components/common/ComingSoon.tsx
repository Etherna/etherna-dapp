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

import { ClockIcon } from "@heroicons/react/outline"

type ComingSoonProps = {
  title?: string
  description?: string
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title = "Coming Soon!", description }) => {
  return (
    <div className="w-full h-full">
      <div className="w-full max-w-lg m-auto flex flex-col">
        <h2 className="flex items-center text-lg lg:text-2xl font-bold">
          <ClockIcon className="h-[1.2em] mr-2" aria-hidden />
          {title}
        </h2>
        <a href="https://info.etherna.io/#roadmap" target="_blank" rel="noreferrer">
          Roadmap ↗
        </a>

        <p className="mt-6 text-sm font-medium text-gray-700 dark:text-gray-400">
          Feature description:
        </p>
        <p className="mt-2 text-gray-800 dark:text-gray-200">{description}</p>
      </div>
    </div>
  )
}

export default ComingSoon
