import { UserState } from "@state/typings"

export const UserActionTypes = {
  USER_ENS_UPDATE: "USER_ENS_UPDATE",
  USER_SIGNOUT: "USER_SIGNOUT",
  USER_UPDATE_IDENTITY: "USER_UPDATE_IDENTITY",
  USER_UPDATE_CREDIT: "USER_UPDATE_CREDIT",
  USER_UPDATE_SIGNEDIN: "USER_UPDATE_SIGNEDIN",
} as const

// Export dispatch actions
type UpdateEnsAction = {
  type: typeof UserActionTypes.USER_ENS_UPDATE
  ens: string|null|undefined
}
type UserSignoutAction = {
  type: typeof UserActionTypes.USER_SIGNOUT
}
type UpdateIdentityAction = {
  type: typeof UserActionTypes.USER_UPDATE_IDENTITY
  address?: string
  manifest?: string
  prevAddresses?: string[]
}
type UpdateCreditAction = {
  type: typeof UserActionTypes.USER_UPDATE_CREDIT
  credit: number
}
type UpdateSignedInAction = {
  type: typeof UserActionTypes.USER_UPDATE_SIGNEDIN
  isSignedIn: boolean
  isSignedInGateway: boolean
}

export type UserActions = (
  UpdateEnsAction |
  UserSignoutAction |
  UpdateIdentityAction |
  UpdateCreditAction |
  UpdateSignedInAction
)


// Init reducer
const userReducer = (state: UserState = {}, action: UserActions): UserState => {
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

    case UserActionTypes.USER_UPDATE_CREDIT:
      return {
        ...state,
        credit: action.credit,
      }

    case UserActionTypes.USER_UPDATE_SIGNEDIN:
      return {
        ...state,
        isSignedIn: action.isSignedIn,
        isSignedInGateway: action.isSignedInGateway,
      }

    default:
      return state
  }
}

export default userReducer
