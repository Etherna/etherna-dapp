import loginRedirect from "@state/actions/user/loginRedirect"
import logoutRedirect from "@state/actions/user/logoutRedirect"

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
