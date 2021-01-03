const fs = require("fs")
const express = require("express")
const bodyParser = require("body-parser")
const https = require("https")
const cors = require("cors")

const { ValidatorMiddleware } = require("./middlewares/validator-middleware")
const { SwarmMiddleware } = require("./middlewares/swarm-middleware")

require("./utils/env")

/**
 * Setup node server
 */
const app = express()
const port = 44362

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.raw({
  // verify: function (req, res, buf, encoding) {
  //   if (buf && buf.length) {
  //     req.rawBody = buf.toString(encoding || "utf8")
  //   }
  // },
  type: "*/*",
  limit: "100mb"
}))
app.use(
  cors({
    credentials: true,
    origin: true
  })
)
app.use(ValidatorMiddleware)
app.use(SwarmMiddleware)

const PrivateKeyPath = process.env.SSL_PRIVATE_KEY_PATH
const CertificatePath = process.env.SSL_CERTIFICATE_PATH

if (fs.existsSync(PrivateKeyPath) && fs.existsSync(CertificatePath)) {
  const privateKey = fs.readFileSync(PrivateKeyPath, "utf8")
  const certificate = fs.readFileSync(CertificatePath, "utf8")

  const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app)
  httpsServer.listen(port)
} else {
  app.listen(port)
}

process.setMaxListeners(0)
