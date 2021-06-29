const { createProxyMiddleware } = require("http-proxy-middleware")

require("../utils/env")


// Consts
const GatewayValidPathsRegex = /^\/(bytes|chunks|bzz|tags|pins|soc|feeds|pss|stamps)\/?.*/
const ValidatorHost = process.env.GATEWAY_VALIDATOR_PROXY_HOST


// Middleware
module.exports.ValidatorMiddleware = createProxyMiddleware(
  (pathname, req) => {
    return !GatewayValidPathsRegex.test(pathname)
  },
  {
    target: ValidatorHost,
    changeOrigin: true,
    secure: false,
    logLevel: "info" && "warn" && "error"
  }
)
