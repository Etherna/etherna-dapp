const getBasename = () => {
    const bzzPattern = /\/bzz:\/([^/]+)/
    const basename = bzzPattern.test(window.location.pathname)
        ? window.location.pathname.match(bzzPattern)[0]
        : ""
    return basename
}

export default getBasename