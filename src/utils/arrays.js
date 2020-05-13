/**
 * Split an array into 2
 * @param {array} array Array to split
 * @param {number} limit Limit beyond which the split should take place
 * @returns {array} An array containing 1 or 2 arrays
 */
export const splitArray = (array, limit) => {
    if (array.length < limit || array.length < 2) {
        return [array]
    } else {
        const index = Math.floor(array.length / 2)
        return [array.slice(0, index), array.slice(index + 1)]
    }
}
