export const UserActionTypes = {
  USER_ENS_UPDATE: "USER_ENS_UPDATE",
  USER_SIGNOUT: "USER_SIGNOUT",
  USER_UPDATE_IDENTITY: "USER_UPDATE_IDENTITY",
  USER_UPDATE_SIGNEDIN: "USER_UPDATE_SIGNEDIN",
}


/**
 * @param {import("..").UserState} state
 * @param {object} action
 * @returns {import("..").UserState}
 */
const userReducer = (state = {}, action) => {
  switch (action.type) {
    case UserActionTypes.USER_ENS_UPDATE:
      return {
        ...state,
        ens: action.ens,
      }

    case UserActionTypes.USER_SIGNOUT:
      return {
        isSignedIn: false,
      }

    case UserActionTypes.USER_UPDATE_IDENTITY:
      return {
        ...state,
        address: action.address,
        identityManifest: action.manifest,
        prevAddresses: action.prevAddresses,
      }

    case UserActionTypes.USER_UPDATE_SIGNEDIN:
      return {
        ...state,
        isSignedIn: action.isSignedIn,
      }

    default:
      return state
  }
}

export default userReducer
