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
 * Split an array into 2
 *
 * @param array Array to split
 * @param limit Limit beyond which the split should take place
 * @returns An array containing 1 or 2 arrays
 */
export const splitArray = <T>(array: Array<T>, limit: number): Array<Array<T>> => {
  if (array.length < limit || array.length < 2) {
    return [array]
  } else {
    const index = Math.floor(array.length / 2)
    return [array.slice(0, index), array.slice(index + 1)]
  }
}

/**
 * Clone array and every object containing it
 *
 * @param array Array to clone
 * @returns Cloned array
 */
export const deepCloneArray = <T>(array: Array<T>): Array<T> => {
  return JSON.parse(JSON.stringify(array))
}
