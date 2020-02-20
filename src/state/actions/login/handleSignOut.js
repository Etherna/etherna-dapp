import { navigate } from "gatsby"
import { store } from "../../store"

const handleSignOut = () => {
    const {
        user: { box, isLoggedIn },
    } = store.getState()

    if (isLoggedIn) {
        if (box) box.logout()
        window.localStorage.removeItem("defaultWallet")
        window.localStorage.removeItem("userEthAddress")
        window.localStorage.removeItem("prevNetwork")
        window.localStorage.removeItem("prevPrevNetwork")
        window.localStorage.removeItem("currentNetwork")
        window.localStorage.removeItem("shouldShowSwitchNetwork")

        store.dispatch({
            type: "USER_SIGN_OUT",
        })

        store.dispatch({
            type: "UI_SIGN_OUT",
            onSyncFinished: false,
        })

        store.dispatch({
            type: "SPACES_SIGN_OUT",
        })

        store.dispatch({
            type: "MY_DATA_SIGNOUT",
        })

        navigate("/")
    }
}

export default handleSignOut
