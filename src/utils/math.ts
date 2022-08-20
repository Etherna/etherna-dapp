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
 * Clamp a value between a min and a max
 */
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(min, value), max)

/**
 * Return the integer + decimal parts of a number
 * 
 * @param num The number to split
 * @param fractionDigits If provided will round to a number of digits
 */
export const getDecimalParts = (num: number, fractionDigits?: number) => {
  const formatted = new Intl.NumberFormat(undefined, {
    notation: "standard",
    maximumFractionDigits: fractionDigits,
  }).format(num)

  const [integer, decimal] = formatted.split(".")
  const sign = num < 0 ? -1 : 1

  return {
    integer,
    decimal: decimal || "0",
    sign
  }
}
