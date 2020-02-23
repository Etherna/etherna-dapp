import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
import { UIActionTypes } from "@state/reducers/uiReducer"
import { fetchAccounts } from "@utils/ethFuncs"

export const pollAddress = async () => {
    setTimeout(async () => {
        try {
            const { isSignedIn } = store.getState().user
            const { web3, currentAddress } = store.getState().env

            if (web3) {
                const accounts = await fetchAccounts(web3)
                const newAddress = accounts[0]

                if (newAddress !== currentAddress) {
                    store.dispatch({
                        type: EnvActionTypes.ENV_CURRENT_ADDRESS,
                        currentAddress: newAddress,
                        previusAddress: currentAddress,
                    })
                    store.dispatch({
                        type: UIActionTypes.UI_TOGGLE_ADDRESS_CHANGE,
                        showAccountSwitchModal: true,
                    })
                }
            }

            if (isSignedIn) {
                pollAddress()
            }
        } catch (error) {
            console.error(error)
        }
    }, 1000)
}

export default pollAddress
