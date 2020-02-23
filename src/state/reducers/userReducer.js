export const UserActionTypes = {
    USER_SIGNIN: "USER_SIGNIN",
    USER_SIGNOUT: "USER_SIGNOUT",
    USER_UPDATE_ADDRESS: "USER_UPDATE_ADDRESS",
    USER_UPDATE_SIGNEDIN: "USER_UPDATE_SIGNEDIN",
}

const userReducer = (state = {}, action) => {
    switch (action.type) {
        case UserActionTypes.USER_SIGNIN:
            return {
                ...state,
                box: action.box,
                ens: action.ens,
                threeId: action.threeId,
                address: action.address,
            }

        case UserActionTypes.USER_SIGNOUT:
            return {}

        case UserActionTypes.USER_UPDATE_ADDRESS:
            return {
                ...state,
                isSignedIn: action.isSignedIn,
                address: action.address,
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
