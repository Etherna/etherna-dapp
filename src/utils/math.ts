/**
 * Clamp a value between a min and a max
 */
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(min, value), max)

/**
 * Return the integer + decimal parts of a number
 * @param num The number to split
 * @param fractionDigits If provided will round to a number of digits
 */
export const getDecimalParts = (num: number, fractionDigits?: number) => {
  const abs = Math.abs(num)
  const decimalFull = abs - Math.floor(abs)
  const decimal = +(
    fractionDigits
      ? +decimalFull.toFixed(fractionDigits)
      : decimalFull
  ).toString().replace(/^0./, "")

  const integer = Math.round(abs - decimalFull)
  const sign = num < 0 ? -1 : 1

  return {
    integer,
    decimal,
    sign
  }
}
