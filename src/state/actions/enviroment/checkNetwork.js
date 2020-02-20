import { store } from "../../store"

const checkNetworkFunc = async web3Obj => {
    let network
    let networkName
    const hasGetNetwork = web3Obj.version && web3Obj.version.getNetwork
    const hasGetId = web3Obj.eth.net && web3Obj.eth.net.getId
    const hasGetNetworkType = web3Obj.eth.net && web3Obj.eth.net.getNetworkType

    try {
        if (hasGetNetwork) {
            network = await web3Obj.version.getNetwork()
        } else if (hasGetId) {
            network = await web3Obj.eth.net.getId()
        } else if (hasGetNetworkType) {
            network = await web3Obj.eth.net.getNetworkType()
            return network
        }
    } catch (error) {
        console.error("error", error)
    }

    switch (network) {
        case 1:
            networkName = "Main"
            break
        case 2:
            networkName = "Morder"
            break
        case 3:
            networkName = "Ropsten"
            break
        case 4:
            networkName = "Rinkeby"
            break
        case 42:
            networkName = "Kovan"
            break
        default:
            networkName = "Unknown"
            break
    }
    return networkName
}

// if has web3 wallet
const checkNetwork = () => async dispatch => {
    const { web3Obj } = store.getState().user

    const network = await checkNetworkFunc(web3Obj)
    const currentNetwork = network

    const prevPrevNetwork = window.localStorage.getItem("prevNetwork")
    const prevNetwork = window.localStorage.getItem("currentNetwork")
    const shouldShowSwitchNetwork = window.localStorage.getItem(
        "shouldShowSwitchNetwork"
    )
    window.localStorage.setItem("prevPrevNetwork", prevPrevNetwork)
    window.localStorage.setItem("prevNetwork", prevNetwork)
    window.localStorage.setItem("currentNetwork", currentNetwork)

    if (
        prevNetwork &&
        prevNetwork !== currentNetwork &&
        store.getState().user.isLoggedIn &&
        shouldShowSwitchNetwork === "true"
    ) {
        window.localStorage.setItem("shouldShowSwitchNetwork", false)
        dispatch({
            type: "USER_NETWORK_UPDATE",
            currentNetwork,
            prevNetwork,
            prevPrevNetwork,
        })
        dispatch({
            type: "UI_HANDLE_DIFFERENT_NETWORK_MODAL",
            showDifferentNetworkModal: true,
            isFetchingThreeBox: false,
        })
    } else {
        window.localStorage.setItem("shouldShowSwitchNetwork", true)
        dispatch({
            type: "USER_NETWORK_UPDATE",
            currentNetwork,
            prevNetwork,
            prevPrevNetwork,
        })
    }
}

export default checkNetwork
