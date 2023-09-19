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

import { ReactComponent as PipIcon } from "@/assets/icons/player/pip.svg"

import ToolbarButton from "./ToolbarButton"
import usePlayerStore from "@/stores/player"

const PiPButton: React.FC = () => {
  const togglePiP = usePlayerStore(state => state.togglePiP)

  return <ToolbarButton icon={<PipIcon aria-hidden />} onClick={togglePiP} />
}

export default PiPButton
