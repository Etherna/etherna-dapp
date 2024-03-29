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
 * Handle a promise withour throwing error.
 * A null value is returned instead.
 *
 * @param promise Promise to handle
 */
export const nullablePromise = async <T>(promise: Promise<T>) =>
  new Promise<T | null>(resolve => {
    promise.then(result => resolve(result)).catch(() => resolve(null))
  })

/**
 * Handle a promise withour throwing error, returning a tuple with result and error.
 *
 * @param promise Promise to handle
 * @returns The promise result and error
 */
export const settledPromise = async <T>(
  promise: Promise<T>
): Promise<readonly [result: T | null, error: Error | undefined]> => {
  try {
    const result = await promise
    return [result, undefined] as const
  } catch (error: any) {
    return [null, error as Error] as const
  }
}

/**
 * Get & filter fullfilled promises
 *
 * @param promises Settled promises array
 * @returns The filtered fullfilled results
 */
export const fullfilledPromisesResult = <T>(promises: PromiseSettledResult<T>[]): T[] => {
  return promises
    .filter(promise => promise.status === "fulfilled")
    .map(promise => (promise as PromiseFulfilledResult<T>).value)
}

export const wait = (delay = 1000) =>
  new Promise<void>(res => {
    if (import.meta.env.DEV) {
      console.info(`Delaying for ${delay}ms`)
      setTimeout(res, delay)
    } else {
      res()
    }
  })
