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

import React, { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMatomo } from "@datapunt/matomo-tracker-react"
import classNames from "classnames"

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { XMarkIcon } from "@heroicons/react/24/solid"

import { TextInput } from "@/components/ui/inputs"
import { Topbar } from "@/components/ui/navigation"
import routes from "@/routes"

const SearchItem: React.FC = () => {
  const navigate = useNavigate()
  const { trackSiteSearch } = useMatomo()
  const [showInput, setShowInput] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === "Enter" && searchQuery) {
        navigate(routes.search(searchQuery))
        trackSiteSearch({
          keyword: searchQuery.toLowerCase(),
        })
      }
    },
    [navigate, searchQuery, trackSiteSearch]
  )

  return (
    <Topbar.Item
      className={classNames({
        "absolute left-1 top-1 right-1 z-20 py-1.5 md:relative md:top-0": showInput,
        "bg-gray-200 dark:bg-gray-800": showInput,
      })}
      prefix={<MagnifyingGlassIcon width={22} strokeWidth={3} aria-hidden />}
      onClick={() => setShowInput(true)}
    >
      {showInput && (
        <>
          <TextInput
            className="w-full md:w-auto"
            inputClassName={classNames(
              "pr-0 pl-2 pt-2 pb-2 pr-8 md:pr-0",
              "bg-transparent dark:bg-transparent",
              "focus:ring-0 focus:border-none"
            )}
            value={searchQuery}
            onChange={setSearchQuery}
            onKeyDown={handleKeyDown}
            onBlur={() => setShowInput(false)}
            autoFocus
          />
          <div role="button" className="absolute right-2" onClick={() => setShowInput(false)}>
            <XMarkIcon width={20} aria-hidden />
          </div>
        </>
      )}
    </Topbar.Item>
  )
}

export default SearchItem
