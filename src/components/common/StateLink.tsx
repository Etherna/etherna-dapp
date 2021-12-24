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
import { Link, LinkProps } from "react-router-dom"
import omit from "lodash/omit"

type StateLinkExtraProps = {
  state?: any
}

const StateLink: React.FC<LinkProps & StateLinkExtraProps> = (props) => {
  const updateState = () => {
    window.routeState = props.state
  }

  return (
    <Link {...(omit(props, "state"))} onMouseDown={updateState}>
      {props.children}
    </Link>
  )
}

export default StateLink
