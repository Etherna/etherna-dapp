/**
 * Safely parse a JSON value from the local storage
 * @param key Storage key
 * @returns The JSON parsed value
 */
export const parseLocalStorage = <T>(key: string) => {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) as T : null
}
