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

import Time from "@/components/media/Time"
import { usePlayerState } from "@/context/player-context/hooks"

const PlayerTimeProgress: React.FC = () => {
  const [state] = usePlayerState()
  const { currentTime, duration } = state

  return (
    <div className="font-medium tracking-tighter text-xs sm:text-sm text-gray-200">
      <Time duration={currentTime * duration} />
      <span> / </span>
      <Time duration={duration} />
    </div>
  )
}

export default PlayerTimeProgress
