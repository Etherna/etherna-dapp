/**
 * Execute a list of promises simultaneously
 * @param {Promise[]} promises Array of promises
 */
const promisePipeline = async (promises) => {
    return new Promise(resolve => {
        let results = new Array(promises.length)
        let completed = 0

        const checkResults = () => {
            setTimeout(() => {
                if (completed === promises.length) {
                    resolve(results)
                } else {
                    checkResults()
                }
            }, 100);
        }

        promises.forEach((promise, index) => {
            promise
                .then(res => results[index] = res)
                .catch(error => {
                    console.error(error)
                    results[index] = null
                })
                .finally(() => completed += 1)
        })

        checkResults()
    })
}

export default promisePipeline