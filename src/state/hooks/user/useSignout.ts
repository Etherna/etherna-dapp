import logoutRedirect from "@state/actions/user/logoutRedirect"
import useSelector from "@state/useSelector"

const useSignout = () => {
  const { isSignedIn, isSignedInGateway } = useSelector(state => state.user)

  const signout = () => {
    if (isSignedIn) {
      logoutRedirect()
    }

    if (isSignedInGateway) {
      logoutRedirect("gateway")
    }
  }

  return {
    signout
  }
}

export default useSignout
