/**
 * Split an array into 2
 * @param array Array to split
 * @param limit Limit beyond which the split should take place
 * @returns An array containing 1 or 2 arrays
 */
export const splitArray = <T>(array: Array<T>, limit: number): Array<Array<T>> => {
  if (array.length < limit || array.length < 2) {
    return [array]
  } else {
    const index = Math.floor(array.length / 2)
    return [array.slice(0, index), array.slice(index + 1)]
  }
}

export const deepCloneArray = <T>(array: Array<T>): Array<T> => {
  return JSON.parse(JSON.stringify(array))
}
