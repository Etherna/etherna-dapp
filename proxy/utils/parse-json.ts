export default function parseJSON<T>(data: string): T | null {
  try {
    const json = JSON.parse(data) as T
    return json
  } catch (error) {
    return null
  }
}
