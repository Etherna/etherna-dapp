import { store } from "state/store"
import { UIActionTypes } from "state/reducers/uiReducer"
import { UserActionTypes } from "state/reducers/userReducer"

// fix SSR build issues
const Box = typeof window !== "undefined" ? require("3box") : null

const openBox = async () => {
    store.dispatch({
        type: UIActionTypes.UI_TOGGLE_LOADING_PROFILE,
        isLoadingProfile: true,
    })

    try {
        const {
            user: { address },
            env: { web3 },
        } = store.getState()

        // loading 3box
        const box = await Box.openBox(address, web3.currentProvider)
        await box.syncDone

        store.dispatch({
            type: UserActionTypes.USER_3BOX_UPDATE,
            box,
        })

        box.onSyncDone(() => {
            store.dispatch({
                type: UIActionTypes.UI_TOGGLE_LOADING_PROFILE,
                isLoadingProfile: false,
            })
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

export default openBox
