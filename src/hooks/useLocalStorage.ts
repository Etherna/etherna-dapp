import { useState } from "react"

/**
 * Get / Set a local storage value
 * @param key Storage key
 * @param defaultValue Default value
 * @returns The parsed value
 */
const useLocalStorage = <T>(key: string, defaultValue: T | null = null): [T | null, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) as T : defaultValue
    } catch (error) {
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
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
