const fs = require("fs")
const express = require("express")
const https = require("https")
const cors = require("cors")

const { ValidatorMiddleware } = require("./middlewares/validator-middleware")
const { SwarmMiddleware } = require("./middlewares/swarm-middleware")

/**
 * Setup node server
 */
const privateKey = fs.readFileSync("server/sslcert/server.key", "utf8")
const certificate = fs.readFileSync("server/sslcert/server.crt", "utf8")
const app = express()
const port = 44361

app.use(
  cors({
    credentials: true,
    origin: true
  })
)

app.use(ValidatorMiddleware)

app.use(SwarmMiddleware)

// app.use(
//   createProxyMiddleware({
//     target: validatorHost,
//     changeOrigin: true,
//     secure: false,
//     selfHandleResponse: true,
//     // onProxyRes: (proxyRes, req, res) => {
//     //   console.log(proxyRes)
//     // },
//     onProxyReq: (proxyReq, req, res) => {
//       // const req2 = https.request("https://swarm-gateways.net/", res2 => {
//       //   //console.log(res2)
//       //   let data = ""
//       //   res2.on("data", function (chunk) {
//       //     data += chunk
//       //     //res.write(chunk)
//       //   })
//       //   res2.on("end", function () {
//       //     //console.log(data);
//       //     res.send(data)
//       //   });
//       // })
//       // req2.end()
//       fetch("https://jsonplaceholder.ir/todos/1")
//         .then(res => res.text())
//         .then(body => {
//           res.send(body)
//         })
//     }
//   })
// )

// const validatorProxy = proxy(
//   req => validatorHost + req.path,
// )

// app.use((req, res, next) => {
//   const options = {
//     host: validatorHost,
//     path: req.path,
//     method: req.method,
//     headers: req.headers,
//   }
//   const proxyReq = http.request(options)

//   req.pipe(proxyReq).pipe(res)
// })

const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app)
httpsServer.listen(port)

process.setMaxListeners(0)
