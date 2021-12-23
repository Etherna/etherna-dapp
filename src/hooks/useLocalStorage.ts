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

import { useState } from "react"

/**
 * Get / Set a local storage value
 * @param key Storage key
 * @param defaultValue Default value
 * @returns The parsed value
 */
export default function useLocalStorage<T>(key: string, defaultValue: T | null = null): [T | null, (value: T) => void] {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) as T : defaultValue
    } catch (error: any) {
      console.log(error)
      return defaultValue
    }
  })

  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value)
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error: any) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}
