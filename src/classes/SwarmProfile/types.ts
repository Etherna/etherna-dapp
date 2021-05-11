import SwarmImage from "@classes/SwarmImage"
import { SwarmImageRaw } from "@classes/SwarmImage/types"

export type Profile = {
  /**  Profile address */
  address: string
  /**  Swarm manifest hash */
  manifest?: string
  /**  Name of the Profile */
  name: string|null
  /**  Description of the Profile */
  description?: string|null
  /**  User's avatar */
  avatar?: SwarmImage
  /**  User's cover */
  cover?: SwarmImage
  /** User's location */
  location?: string
  /** User's website */
  website?: string
  /** User's birthday */
  birthday?: string
}

export type ProfileRaw = Omit<Profile, "avatar" | "cover"> & {
  /**  User's raw avatar image */
  avatar?: SwarmImageRaw
  /**  User's raw cover image */
  cover?: SwarmImageRaw
}
