import loginRedirect from "@state/actions/provider/loginRedirect"
import logoutRedirect from "@state/actions/provider/logoutRedirect"

const autoSigninSignout = () => {
  const searchParams = new URLSearchParams(window.location.search)

  // login redirect
  let service = searchParams.get("signin")
  if (service) {
    loginRedirect(service)
  }

  // logout redirect
  service = searchParams.get("signout")
  if (service) {
    logoutRedirect(service)
  }
}

export default autoSigninSignout
