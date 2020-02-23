/**
 * Profile routes
 */
export const getProfilesLink = () => {
    return `/profiles`
}

export const getProfileLink = hash => {
    return `/profile/${encodeURIComponent(hash)}`
}

export const getProfileEditingLink = hash => {
    return `/profile/${encodeURIComponent(hash)}/edit`
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
