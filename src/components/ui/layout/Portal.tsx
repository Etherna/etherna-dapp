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

import { useEffect, useState } from "react"
import ReactDOM from "react-dom"

import type React from "react"

type PortalProps = {
  children?: React.ReactNode
  selector: string
}

const Portal: React.FC<PortalProps> = ({ selector, children }) => {
  const [container, setContainer] = useState<HTMLElement>()

  useEffect(() => {
    const container = document.querySelector<HTMLElement>(selector)
    container && setContainer(container)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector])

  if (!container) return null

  return ReactDOM.createPortal(children, container) as React.ReactNode
}

export default Portal
