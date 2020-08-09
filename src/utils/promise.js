/**
 * Handle a promise withour throwing error.
 * A null value is returned instead.
 *
 * @param {Promise} promise Promise to handle
 */
export const nullablePromise = async promise =>
  new Promise(resolve => {
    promise.then(result => resolve(result)).catch(() => resolve(null))
  })
