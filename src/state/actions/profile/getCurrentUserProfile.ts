import { store } from "@state/store"

/**
 * Get current user profile
 * @returns Current profile info
 */
const getCurrentUserProfile = () => {
  const { name, description, avatar, cover } = store.getState().profile
  return { name, description, avatar, cover }
}

export default getCurrentUserProfile
