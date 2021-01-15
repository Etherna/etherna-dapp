/**
 * Clamp a value between a min and a max
 */
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(min, value), max)
