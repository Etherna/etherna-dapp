import { store } from "@state/store"
import { UserActionTypes } from "@state/reducers/userReducer"

/**
 * Fetch the current identity from the SSO server
 */
const fetchIdentity = async () => {
    try {
        const { oidcManager } = store.getState().user
        await oidcManager.clearStaleState()
        const user = await oidcManager.getUser()

        if (!user) {
            return updateUserSignedOut()
        }

        const identity = user.profile

        // in case user gets signout on the server directly.
        // subscribe for changes and update redux store.
        oidcManager.events.addUserSignedOut(() => signoutCallback(oidcManager))

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

        return updateUserSignedOut()
    }
}

const updateUserSignedOut = () => {
    store.dispatch({
        type: UserActionTypes.USER_UPDATE_SIGNEDIN,
        isSignedIn: false
    })
    return false
}

/**
 * Signout user and clear storage
 * @param {import('oidc-client').UserManager} oidcManager OIDC User Manager
 */
const signoutCallback = async oidcManager => {
    await oidcManager.removeUser()

    store.dispatch({
        type: UserActionTypes.USER_UPDATE_IDENTITY
    })
    store.dispatch({
        type: UserActionTypes.USER_UPDATE_SIGNEDIN,
        isSignedIn: false
    })
}

export default fetchIdentity