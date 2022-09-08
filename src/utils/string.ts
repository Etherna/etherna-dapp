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

/**
 * Add 0 to the left to make a number always a fixed length
 *
 * @param value
 */
export const stringPadLeft = (value: number | null) => {
  if (typeof value !== "number") {
    return null
  }
  const length = Math.max(2, value.toString().length)
  const pad = "0"
  return (new Array(length + 1).join(pad) + value).slice(-length)
}
