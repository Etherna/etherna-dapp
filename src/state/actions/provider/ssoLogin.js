import { store } from "@state/store"

const ssoLogin = () => {
    const { oidcManager } = store.getState().user
    oidcManager.signinRedirect()
}

export default ssoLogin