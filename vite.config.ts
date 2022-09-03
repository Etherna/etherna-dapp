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
import { resolve } from "path"
import stringHash from "string-hash"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import eslintPlugin from "vite-plugin-eslint"
import checker from "vite-plugin-checker"
import { dynamicBase } from "vite-plugin-dynamic-base"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/__dynamic_base__/" : "/",
  build: {
    manifest: true,
    outDir: "build",
  },
  server: {
    https: fs.existsSync("proxy/sslcert/key.pem") && fs.existsSync("proxy/sslcert/cert.pem") && {
      key: fs.readFileSync("proxy/sslcert/key.pem"),
      cert: fs.readFileSync("proxy/sslcert/cert.pem"),
    },
    port: 3000,
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
      generateScopedName: (name, filename, css) => {
        if (name === "dark") return "dark"
        const hash = stringHash(css).toString(36).substr(0, 5)
        return `_${name}_${hash}`
      }
    }
  },
  define: {
    global: "window",
  },
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "src") },
      { find: "stream", replacement: "stream-browserify" },
    ],
  },
  plugins: [
    react(),
    svgr(),
    eslintPlugin({ cache: false }),
    checker({
      typescript: true,
    }),
    dynamicBase({
      publicPath: " window.__dynamic_base__",
      transformIndexHtml: true,
    }),
  ],
}))
