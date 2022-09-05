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
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMatomo } from "@datapunt/matomo-tracker-react"
import classNames from "classnames"

import { SearchIcon } from "@heroicons/react/outline"
import { XIcon } from "@heroicons/react/solid"

import TopbarItem from "@/components/navigation/TopbarItem"
import { TextInput } from "@/components/ui/inputs"
import routes from "@/routes"

const SearchItem: React.FC = () => {
  const navigate = useNavigate()
  const { trackSiteSearch } = useMatomo()
  const [showInput, setShowInput] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" && searchQuery) {
      navigate(routes.search(searchQuery))
      trackSiteSearch({
        keyword: searchQuery.toLowerCase(),
      })
    }
  }

  return (
    <TopbarItem
      className={classNames({
        "absolute left-1 top-1 right-1 md:relative md:top-0 z-1": showInput,
        "bg-gray-200 dark:bg-gray-800": showInput,
      })}
      iconSvg={<SearchIcon aria-hidden />}
      onClick={() => setShowInput(true)}
    >
      {showInput && (
        <>
          <TextInput
            className="w-full md:w-auto"
            inputClassName={classNames(
              "px-0 py-1 pr-8 md:pr-0",
              "bg-transparent dark:bg-transparent border-transparent dark:border-transparent",
              "focus:border-transparent dark:focus:border-transparent"
            )}
            value={searchQuery}
            onChange={setSearchQuery}
            onKeyDown={handleKeyDown}
            onBlur={() => setShowInput(false)}
            autoFocus
          />
          <button className="absolute right-2" onClick={() => setShowInput(false)}>
            <XIcon width={20} aria-hidden />
          </button>
        </>
      )}
    </TopbarItem>
  )
}

export default SearchItem
