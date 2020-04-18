/**
 * Home route
 */
const getHomeLink = () => {
    return `/`
}

/**
 * Channel routes
 */
const getChannelsLink = () => {
    return `/channels`
}

const getChannelLink = hash => {
    return `/channel/${encodeURIComponent(hash)}`
}

const getChannelEditingLink = hash => {
    return `/channel/${encodeURIComponent(hash)}/edit`
}

/**
 * Video routes
 */
const getVideoLink = hash => {
    return `/watch?v=${encodeURIComponent(hash)}`
}

/**
 * Static routes
 */
const getVideoUploadLink = () => {
    return `/upload`
}
const getHowItWorksLink = () => {
    return `/how-it-works`
}

/**
 * Fallback routes
 */
const getNotFoundLink = () => {
    return `/404`
}

export default {
    getHomeLink,
    getChannelsLink,
    getChannelLink,
    getChannelEditingLink,
    getVideoLink,
    getVideoUploadLink,
    getHowItWorksLink,
    getNotFoundLink,
}