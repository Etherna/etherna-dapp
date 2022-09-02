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

import { useCallback, useState } from "react"

type UseLocalStorageReturn<T> = [T | null, (value: T | ((oldValue: T) => T)) => void]

/**
 * Get / Set a local storage value
 * @param key Storage key
 * @param defaultValue Default value
 * @returns The parsed value
 */
export default function useLocalStorage<T>(key: string, defaultValue: T | null = null): UseLocalStorageReturn<T> {
  const getItem = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) as T : defaultValue
    } catch (error: any) {
      console.error(error)
      return defaultValue
    }
  }, [defaultValue, key])

  const [storedValue, setStoredValue] = useState(getItem())

  const setValue = useCallback((value: T | ((oldValue: T) => T)) => {
    try {
      // Save state @ts-ignore
      // @ts-ignore
      const val = typeof value === "function" ? value(getItem()) : value
      setStoredValue(val)
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error: any) {
      console.error(error)
    }
  }, [getItem, key])

  return [storedValue, setValue]
}
