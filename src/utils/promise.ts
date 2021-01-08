/**
 * Handle a promise withour throwing error.
 * A null value is returned instead.
 * @param promise Promise to handle
 */
export const nullablePromise = async <T>(promise: Promise<T>) =>
  new Promise<T|null>(resolve => {
    promise.then(result => resolve(result)).catch(() => resolve(null))
  })
