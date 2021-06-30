import { store } from "@state/store"
import { EnvActionTypes } from "@state/reducers/enviromentReducer"

export const checkIsMobile = () => {
  const mobilePattern = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  let isMobile = mobilePattern.test(navigator.userAgent)

  store.dispatch({
    type: EnvActionTypes.SET_IS_MOBILE,
    isMobile,
  })
}
