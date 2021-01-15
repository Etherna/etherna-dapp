import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"
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
            type: EnvActionTypes.ENV_SET_CURRENT_ADDRESS,
            currentAddress: newAddress,
            previusAddress: currentAddress,
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
