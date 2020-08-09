import { UserManager, WebStorageStateStore } from "oidc-client"

export const UserActionTypes = {
  USER_ENS_UPDATE: "USER_ENS_UPDATE",
  USER_SIGNOUT: "USER_SIGNOUT",
  USER_UPDATE_IDENTITY: "USER_UPDATE_IDENTITY",
  USER_UPDATE_SIGNEDIN: "USER_UPDATE_SIGNEDIN",
}

const hasBasename = window.__basename__ && window.__basename__ !== ""
const appUrl = `${window.location.origin}${hasBasename ? "/" + window.__basename__ : ""}`
const initialState = {
  oidcManager: new UserManager({
    authority: process.env.REACT_APP_SSO_HOST,
    client_id: "ethernaDappClientId",
    redirect_uri: appUrl + "/callback.html",
    response_type: "code",
    scope: "openid ether_accounts",
    post_logout_redirect_uri: appUrl,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    stateStore: new WebStorageStateStore({ store: window.localStorage }),
    automaticSilentRenew: true,
  }),
}

/**
 * @param {import("..").UserState} state
 * @param {object} action
 * @returns {import("..").UserState}
 */
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case UserActionTypes.USER_ENS_UPDATE:
      return {
        ...state,
        ens: action.ens,
      }

    case UserActionTypes.USER_SIGNOUT:
      return {
        oidcManager: state.oidcManager,
        isSignedIn: false,
      }

    case UserActionTypes.USER_UPDATE_IDENTITY:
      return {
        ...state,
        address: action.address,
        username: action.username,
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
