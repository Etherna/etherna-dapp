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

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { XMarkIcon } from "@heroicons/react/24/solid"

import { TextInput } from "@/components/ui/inputs"
import { Topbar } from "@/components/ui/navigation"
import routes from "@/routes"
import classNames from "@/utils/classnames"

const SearchItem: React.FC = () => {
  const navigate = useNavigate()
  const { trackSiteSearch } = useMatomo()
  const [showInput, setShowInput] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleEnter = useCallback(() => {
    if (searchQuery) {
      navigate(routes.search(searchQuery))
      trackSiteSearch({
        keyword: searchQuery.toLowerCase(),
      })
    }
  }, [searchQuery, navigate, trackSiteSearch])

  const handlerBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.currentTarget.value) {
      setShowInput(false)
    }
  }, [])

  const resetInput = useCallback(() => {
    setSearchQuery("")
    setShowInput(false)
  }, [])

  return showInput ? (
    <div
      className={classNames(
        "absolute left-1 top-1 right-1 z-20 py-1.5 md:relative md:top-0",
        "rounded-md bg-gray-200 dark:bg-gray-800"
      )}
    >
      <div className="flex items-center space-x-2 px-2">
        <MagnifyingGlassIcon width={22} strokeWidth={3} aria-hidden />
        <TextInput
          className="w-full md:w-auto"
          inputClassName={classNames(
            "px-0 h-6 pr-8 md:pr-0",
            "bg-transparent dark:bg-transparent",
            "focus:ring-0 focus:border-none"
          )}
          value={searchQuery}
          onChange={setSearchQuery}
          onEnter={handleEnter}
          onBlur={handlerBlur}
          autoFocus
        />
        <div role="button" className="absolute right-2" onClick={resetInput}>
          <XMarkIcon width={20} aria-hidden />
        </div>
      </div>
    </div>
  ) : (
    <Topbar.Item
      as="div"
      prefix={<MagnifyingGlassIcon width={22} strokeWidth={3} aria-hidden />}
      onClick={() => setShowInput(true)}
    />
  )
}

export default SearchItem
