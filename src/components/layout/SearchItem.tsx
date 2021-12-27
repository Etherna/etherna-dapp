import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import classNames from "classnames"

import classes from "@styles/components/layout/SearchItem.module.scss"
import { ReactComponent as CrossIcon } from "@assets/icons/cross.svg"
import { ReactComponent as SearchIcon } from "@assets/icons/navigation/search.svg"

import TopbarItem from "@components/navigation/TopbarItem"
import TextField from "@common/TextField"
import routes from "@routes"

type SearchItemProps = {

}

const SearchItem: React.FC<SearchItemProps> = ({ }) => {
  const history = useHistory()
  const [showInput, setShowInput] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      history.push(routes.getSearchLink(searchQuery))
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
            <CrossIcon aria-hidden />
          </button>
        </>
      )}
    </TopbarItem>
  )
}

export default SearchItem
