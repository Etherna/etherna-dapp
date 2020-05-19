const ssoLogin = () => {
    window.localStorage.setItem("signedIn", "true")

    const returnUrl = encodeURIComponent(window.location.href)
    window.location.href = `${process.env.REACT_APP_SSO_HOST}/identity/account/login?returnUrl=${returnUrl}`
}

export default ssoLogin