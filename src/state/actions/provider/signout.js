import { store } from "@state/store"

const signout = async (clearStorage = true) => {
    const { isSignedIn, oidcManager } = store.getState().user

    if (isSignedIn) {
        if (clearStorage) {
            clearStore()
        }
        await oidcManager.signoutRedirect()
    }
}

const clearStore = () => {
    window.localStorage.removeItem("defaultWallet")
    window.localStorage.removeItem("prevNetwork")
    window.localStorage.removeItem("currentNetwork")
    window.localStorage.removeItem("shouldShowSwitchNetwork")

    /**
     * With redirect there is no need to update
     * the store state.
     */
    // store.dispatch({
    //     type: UserActionTypes.USER_SIGNOUT,
    // })
    // store.dispatch({
    //     type: ProfileActionTypes.PROFILE_SIGNOUT,
    // })
}

export default signout
