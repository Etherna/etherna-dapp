const fs = require("fs")
const path = require("path")

const envPath = fs.existsSync(path.join(__dirname, "./../../.env.development"))
  ? ".env.development"
  : ".env"

require("dotenv").config({
  path: envPath,
})
