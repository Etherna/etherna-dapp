import { store } from "@state/store"
import { UserActionTypes } from "@state/reducers/userReducer"

/**
 * Fetch the current identity from the SSO server
 */
const fetchIdentity = async () => {
    try {
        const { oidcManager } = store.getState().user
        const user = await oidcManager.getUser()
        const identity = user.profile

        store.dispatch({
            type: UserActionTypes.USER_UPDATE_IDENTITY,
            address: identity.ether_address,
            username: identity.username,
        })
        store.dispatch({
            type: UserActionTypes.USER_UPDATE_SIGNEDIN,
            isSignedIn: true
        })

        return true
    } catch (error) {
        console.error(error)

        store.dispatch({
            type: UserActionTypes.USER_UPDATE_SIGNEDIN,
            isSignedIn: false
        })

        return false
    }
}

export default fetchIdentity