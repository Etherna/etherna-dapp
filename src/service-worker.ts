import { registerSW } from "virtual:pwa-register"

const registerPWA = (register: boolean) => {
  register && registerSW({
    onNeedRefresh: () => {
      window.dispatchEvent(new Event("pwaupdate"))
    },
    onOfflineReady: () => {
      window.dispatchEvent(new Event("pwaofflineready"))
    },
  })
}

export default registerPWA
