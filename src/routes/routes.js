/**
 * Home route
 */
export const getHomeLink = () => {
    return `/`
}

/**
 * Channel routes
 */
export const getChannelsLink = () => {
    return `/channels`
}

export const getChannelLink = hash => {
    return `/channel/${encodeURIComponent(hash)}`
}

export const getChannelEditingLink = hash => {
    return `/channel/${encodeURIComponent(hash)}/edit`
}

/**
 * Video routes
 */
export const getVideoLink = hash => {
    return `/watch?v=${encodeURIComponent(hash)}`
}

/**
 * Static routes
 */
export const getVideoUploadLink = () => {
    return `/upload`
}
export const getHowItWorksLink = () => {
    return `/how-it-works`
}

/**
 * Fallback routes
 */
export const getNotFoundLink = () => {
    return `/404`
}