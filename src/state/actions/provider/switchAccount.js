import signin from "./signin"
import signout from "./signout"

const switchAccount = async () => {
    await signout()
    await signin()
}

export default switchAccount