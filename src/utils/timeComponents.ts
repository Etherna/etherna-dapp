/**
 * Get the hours, minutes and seconds of a time in seconds
 * @param {number} time Time in seconds
 */
const timeComponents = (time: number|string|null|undefined) => {
  time = parseInt(`${time || 0}`)

  let hours: number|null = Math.floor(time / 3600)
  if (hours >= 1) {
    time = time - hours * 3600
  } else {
    hours = null
  }
  const minutes = Math.floor(time / 60)
  const seconds = time - minutes * 60

  return {
    hours: stringPadLeft(hours),
    minutes: stringPadLeft(minutes)!,
    seconds: stringPadLeft(seconds)!,
  }
}

/**
 * Add 0 to the left to make a number always a fixed length
 * @param value
 */
const stringPadLeft = (value: number|null) => {
  if (typeof value !== "number") {
    return null
  }
  const length = Math.max(2, value.toString().length)
  const pad = "0"
  return (new Array(length + 1).join(pad) + value).slice(-length)
}

export default timeComponents
