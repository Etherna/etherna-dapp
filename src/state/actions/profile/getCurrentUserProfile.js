import { store } from "@state/store"

/**
 * Get current user profile
 *
 * @typedef {object} CurrentProfile
 * @property {string} name
 * @property {string} description
 * @property {import("@utils/swarmProfile").SwarmImage} avatar
 * @property {import("@utils/swarmProfile").SwarmImage} cover
 *
 * @returns {CurrentProfile}
 */
const getCurrentUserProfile = () => {
  const { name, description, avatar, cover } = store.getState().profile
  return { name, description, avatar, cover }
}

export default getCurrentUserProfile
