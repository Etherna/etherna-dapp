export const ProfileActionTypes = {
  PROFILE_UPDATE: "PROFILE_UPDATE",
  PROFILE_SAVE: "PROFILE_SAVE",
  PROFILE_SIGNOUT: "PROFILE_SIGNOUT",
}

/**
 * @param {import("../typings").ProfileState} state
 * @param {object} action
 * @returns {import("../typings").ProfileState}
 */
const profileReducer = (state = {}, action) => {
  switch (action.type) {
    case ProfileActionTypes.PROFILE_UPDATE:
      return {
        ...state,
        name: action.name,
        description: action.description,
        avatar: action.avatar,
        cover: action.cover,
        location: action.location,
        website: action.website,
        birthday: action.birthday,
        existsOnIndex: action.existsOnIndex,
      }

    case ProfileActionTypes.PROFILE_SAVE:
      return {
        ...state,
        name: action.name,
        description: action.description,
        avatar: action.avatar,
        cover: action.cover,
      }

    case ProfileActionTypes.PROFILE_SIGNOUT:
      return {}

    default:
      return state
  }
}

export default profileReducer
