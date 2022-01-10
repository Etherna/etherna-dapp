import { checkIsLegacyBrowser } from "@utils/browser"

export default function unsupportedRender(renderFunc: () => void) {
  if (checkIsLegacyBrowser()) {
    renderFunc()
  }
}
