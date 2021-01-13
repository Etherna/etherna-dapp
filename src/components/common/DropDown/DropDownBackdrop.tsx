import React from "react"

import { ReducerTypes, useStateValue } from "./DropDownContext"

const DropDownBackdrop = () => {
  const [state, dispatch] = useStateValue()
  const isDropDownOpen = state.current !== undefined

  const handleClear = () => {
    dispatch({
      type: ReducerTypes.CLEAR,
    })
  }

  return (
    <>
      {isDropDownOpen && (
        <div
          className="click-handler"
          role="button"
          tabIndex={0}
          onClick={() => handleClear()}
          onKeyDown={() => handleClear()}
        />
      )}
    </>
  )
}

export default DropDownBackdrop
