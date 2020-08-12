import { store } from "@state/store"

const loginRedirect = () => {
  const { indexClient } = store.getState().env
  indexClient.loginRedirect()
}

export default loginRedirect
