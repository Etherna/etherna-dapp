/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import fs from "fs"
import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"
import eslintPlugin from "vite-plugin-eslint"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    manifest: true,
    outDir: "build",
  },
  server: {
    https: mode === "development" && fs.existsSync("ssl/key.pem") && fs.existsSync("ssl/cert.pem") && {
      key: fs.readFileSync("proxy/sslcert/key.pem"),
      cert: fs.readFileSync("proxy/sslcert/cert.pem"),
    },
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    }
  },
  define: {
    global: "window",
  },
  plugins: [
    tsconfigPaths({ root: "." }),
    reactRefresh(),
    svgr(),
    eslintPlugin({ cache: false })
  ],
}))
