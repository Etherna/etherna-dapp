import pollAddress from "./pollAddress"
import { store } from "@state/store"
import { UIActionTypes } from "@state/reducers/uiReducer"
import { UserActionTypes } from "@state/reducers/userReducer"
import fetchProfile from "@state/actions/profile/fetchProfile"
import { resolveEnsName } from "@utils/ethFuncs"

const loadProfile = async () => {
    const {
        user: { address },
        env: { web3 },
    } = store.getState()

    try {
        // fetching address ens name
        resolveEns(address, web3)

        // fetching profile data
        fetchProfile(address)

        // observe address change
        pollAddress()
    } catch (error) {
        console.error(error)
        store.dispatch({
            type: UIActionTypes.UI_SHOW_ERROR,
            errorMessage: error.message,
            errorTitle: "Profile Error",
        })
    }
}

const resolveEns = async (address, web3) => {
    const ens = await resolveEnsName(address, web3)
    store.dispatch({
        type: UserActionTypes.USER_ENS_UPDATE,
        ens,
    })
}

export default loadProfile
