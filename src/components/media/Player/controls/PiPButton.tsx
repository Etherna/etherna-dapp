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

import { useStateValue, ReducerTypes } from "../PlayerContext"
import { ReactComponent as PipIcon } from "@svg/icons/player/pip-icon.svg"

const PiPButton = () => {
  const [, dispatch] = useStateValue()

  const togglePictureInPicture = () => {
    dispatch({
      type: ReducerTypes.TOGGLE_PICTURE_IN_PICTURE,
    })
  }

  return (
    <div
      className="btn btn-option"
      onClick={togglePictureInPicture}
      role="button"
      tabIndex={0}
    >
      <PipIcon />
    </div>
  )
}

export default PiPButton
