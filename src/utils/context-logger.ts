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
 */

/* eslint-disable no-console */

type Reducer<State = any, Action = any> = (state: State, action: Action) => State

let lastAction: any

export default function logger<R extends Reducer>(reducer: R): R {
  const reducerWithLogger = (state: any, action: any) => {
    const next = reducer(state, action)

    if (action !== lastAction) {
      console.group(
        `%caction: %c${action.type} %cat ${getCurrentTimeFormatted()}`,
        "color: lightgray; font-weight: 300;",
        "color: white; font-weight: bold;",
        "color: lightblue; font-weight: lighter;"
      )
      console.log("%cprev state:", "color: #9E9E9E; font-weight: 700;", state)
      console.log("%caction:", "color: #00A7F7; font-weight: 700;", action)
      console.log("%cnext state:", "color: #47B04B; font-weight: 700;", next)
      console.groupEnd()
    }

    lastAction = action

    return next
  }

  return reducerWithLogger as R
}

const getCurrentTimeFormatted = () => {
  const currentTime = new Date()
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const seconds = currentTime.getSeconds()
  const milliseconds = currentTime.getMilliseconds()
  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}
