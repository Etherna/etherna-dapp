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

import { timeComponents } from "@/utils/time"

type TimeProps = {
  duration: number
}

const Time: React.FC<TimeProps> = ({ duration = 0 }) => {
  const { hours, minutes, seconds } = timeComponents(duration)

  return (
    <span>
      {hours ? `${hours}:` : null}
      {minutes}:{seconds}
    </span>
  )
}

export default Time
