import injectWeb3 from "./injectWeb3"
import loadProfile from "./loadProfile"
import { checkMobileWeb3, checkNetwork } from "./network"

const signin = async () => {
    await checkMobileWeb3()
    await injectWeb3()
    await checkNetwork()
    await loadProfile()
}

export default signin
