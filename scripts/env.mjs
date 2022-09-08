import { config } from "dotenv"
import fs from "node:fs"
import path from "node:path"

config({
  path: fs.existsSync(path.resolve(".env.development")) ? ".env.development" : ".env",
})
