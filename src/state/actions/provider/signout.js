import { store } from "@state/store"
import { ProfileActionTypes } from "@state/reducers/profileReducer"
import { UserActionTypes } from "@state/reducers/userReducer"
import { getIdentity } from "@utils/ethernaResources/identityResources"

const signout = async (clearStorage = true) => {
    const { isSignedIn, oidcManager } = store.getState().user

    if (isSignedIn) {
        try {
            await oidcManager.signinPopup()
        } catch {}
        try {
            await getIdentity()
        } catch (error) {
            clearStore(clearStorage)
        }
    }
}

const clearStore = (clearLocalStorage = true) => {
    if (clearLocalStorage) {
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

export default signout
