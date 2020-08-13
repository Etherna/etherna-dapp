/**
 * Home route
 */
export const getHomeLink = () => {
  return `/`
}

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
export const getVideoLink = (hash, sourcePath) => {
  return `/watch?v=${hash}${encodeURIComponent(sourcePath ? `/${sourcePath}` : ``)}`
}

export const getVideoSettingsLink = hash => {
  return `/videoSettings?v=${encodeURIComponent(hash)}`
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
export const getShortcutsLink = () => {
  return `/shortcuts`
}

/**
 * Fallback routes
 */
export const getNotFoundLink = () => {
  return `/notfound`
}
