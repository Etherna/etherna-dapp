import pollAddress from "./pollAddress"
import { store } from "state/store"
import { UIActionTypes } from "state/reducers/uiReducer"
import { UserActionTypes } from "state/reducers/userReducer"
import fetchProfile from "state/actions/profile/fetchProfile"
import { resolveEnsName } from "utils/ethFuncs"

const load3Box = async () => {
    store.dispatch({
        type: UIActionTypes.UI_TOGGLE_CONNECTING_WALLET,
        isConnectingWallet: true,
    })

    const {
        user: { address },
        env: { web3 },
    } = store.getState()

    try {
        // fetching address ens name
        const ens = await resolveEnsName(address, web3)

        // fetching profile data
        loadProfile(address)

        store.dispatch({
            type: UserActionTypes.USER_ENS_UPDATE,
            ens,
        })
    } catch (error) {
        console.error(error)
        store.dispatch({
            type: UIActionTypes.UI_SHOW_ERROR,
            errorMessage: error.message,
            errorTitle: "3Box profile error",
        })
    }
}

const loadProfile = address => {
    store.dispatch({
        type: UIActionTypes.UI_TOGGLE_CONNECTING_WALLET,
        isConnectingWallet: false,
    })
    store.dispatch({
        type: UIActionTypes.UI_TOGGLE_LOADING_PROFILE,
        isLoadingProfile: true,
    })

    pollAddress()
    fetchProfile(address)
}

export default load3Box
