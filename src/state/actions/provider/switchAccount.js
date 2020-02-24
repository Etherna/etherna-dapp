import signin from "./signin"
import signout from "./signout"

const switchAccount = async () => {
    await signout(false)
    await signin()
}

export default switchAccount