import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { UserActionTypes } from "@state/reducers/userReducer"

const signout = async (clearStorage = true) => {
    const { isSignedIn, box } = store.getState().user

    if (isSignedIn) {
        if (box) box.logout()
        if (clearStorage) {
            window.localStorage.removeItem("defaultWallet")
            window.localStorage.removeItem("prevNetwork")
            window.localStorage.removeItem("currentNetwork")
            window.localStorage.removeItem("shouldShowSwitchNetwork")
        }

        store.dispatch({
            type: UserActionTypes.USER_SIGNOUT,
        })
        store.dispatch({
            type: ProfileActionTypes.PROFILE_SIGNOUT,
        })
    }
}

export default signout
