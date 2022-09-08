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

import react from "@vitejs/plugin-react"
import fs from "fs"
import { resolve } from "path"
import { defineConfig } from "vite"
import checker from "vite-plugin-checker"
import { dynamicBase } from "vite-plugin-dynamic-base"
import eslintPlugin from "vite-plugin-eslint"
import svgr from "vite-plugin-svgr"

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  base: mode === "production" && command === "build" ? "/__dynamic_base__/" : "/",
  build: {
    manifest: true,
    outDir: "build",
  },
  server: {
    https: fs.existsSync("proxy/sslcert/key.pem") &&
      fs.existsSync("proxy/sslcert/cert.pem") && {
        key: fs.readFileSync("proxy/sslcert/key.pem"),
        cert: fs.readFileSync("proxy/sslcert/cert.pem"),
      },
    port: 3000,
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
