const fs = require('fs')
const path = require('path')
const corsServer = require('cors-anywhere')

require("./utils/env")

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 5555

corsServer.createServer({
  originWhitelist: [],
  requireHeader: [],
  httpsOptions: {
    key: fs.readFileSync(path.resolve(process.env.SSL_KEY_FILE), "utf8"),
    cert: fs.readFileSync(path.resolve(process.env.SSL_CRT_FILE), "utf8")
  },
}).listen(port, host)
