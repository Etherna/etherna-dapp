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

import { stringPadLeft } from "./string"

/**
 * Get the hours, minutes and seconds of a time in seconds
 * 
 * @param {number} time Time in seconds
 */
export const timeComponents = (time: number | string | null | undefined) => {
  time = parseInt(`${time || 0}`)

  let hours: number | null = Math.floor(time / 3600)
  if (hours >= 1) {
    time = time - hours * 3600
  } else {
    hours = null
  }
  const minutes = Math.floor(time / 60)
  const seconds = time - minutes * 60

  return {
    hours: stringPadLeft(hours),
    minutes: stringPadLeft(minutes)!,
    seconds: stringPadLeft(seconds)!,
  }
}
