import { store } from "@state/store"
import { Profile } from "@utils/swarmProfile"

/**
 * Get current user profile
 * @returns Current profile info
 */
const getCurrentUserProfile = (): Profile => {
  const { name, description, avatar, cover } = store.getState().profile
  const { address } = store.getState().user
  return {
    name: name || "",
    address: address || "",
    description,
    avatar,
    cover
  }
}

export default getCurrentUserProfile
