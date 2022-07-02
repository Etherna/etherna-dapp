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
import classNames from "classnames"
import { useMatomo } from "@datapunt/matomo-tracker-react"

import classes from "@/styles/components/layout/SearchItem.module.scss"
import { XIcon } from "@heroicons/react/solid"
import { SearchIcon } from "@heroicons/react/outline"

import TopbarItem from "@/components/navigation/TopbarItem"
import TextField from "@/components/common/TextField"
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
      className={classNames(classes.searchItem, {
        [classes.active]: showInput,
      })}
      iconSvg={<SearchIcon />}
      onClick={() => setShowInput(true)}
    >
      {showInput && (
        <>
          <TextField
            className={classes.searchItemField}
            value={searchQuery}
            onChange={setSearchQuery}
            onKeyDown={handleKeyDown}
            onBlur={() => setShowInput(false)}
            autoFocus
          />
          <button className={classes.searchItemClose} onClick={() => setShowInput(false)}>
            <XIcon aria-hidden />
          </button>
        </>
      )}
    </TopbarItem>
  )
}

export default SearchItem
