const timeComponents = time => {
    time = parseInt(time || 0)

    let hours = Math.floor(time / 3600)
    if (hours >= 1) {
        time = time - hours * 3600
    } else {
        hours = null
    }
    const minutes = Math.floor(time / 60)
    const seconds = time - minutes * 60

    return {
        hours: stringPadLeft(hours),
        minutes: stringPadLeft(minutes),
        seconds: stringPadLeft(seconds),
    }
}

const stringPadLeft = string => {
    if (typeof string !== "number") {
        return null
    }
    const length = 2
    const pad = "0"
    return (new Array(length + 1).join(pad) + string).slice(-length)
}

export default timeComponents
