import injectWeb3 from "./injectWeb3"
import load3box from "./load3box"
import { checkMobileWeb3, checkNetwork } from "./network"

const signin = async () => {
    await checkMobileWeb3()
    await injectWeb3()
    await checkNetwork()
    await load3box()
}

export default signin
