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
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import checker from "vite-plugin-checker"
import { dynamicBase } from "vite-plugin-dynamic-base"
import eslintPlugin from "vite-plugin-eslint"
import svgr from "vite-plugin-svgr"

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, "")

  const useHTTPS =
    env.VITE_APP_HTTPS === "true" &&
    fs.existsSync("proxy/sslcert/key.pem") &&
    fs.existsSync("proxy/sslcert/cert.pem")

  return {
    base: mode === "production" && command === "build" ? "/__dynamic_base__/" : "/",
    build: {
      manifest: true,
      outDir: "build",
    },
    server: {
      https: useHTTPS
        ? {
            key: fs.readFileSync("proxy/sslcert/key.pem"),
            cert: fs.readFileSync("proxy/sslcert/cert.pem"),
          }
        : undefined,
      port: 3000,
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
    define: {
      // global: "window",
    },
    resolve: {
      alias: [{ find: "@", replacement: resolve(__dirname, "src") }],
    },
    plugins: [
      react(),
      svgr({
        svgrOptions: { exportType: "named", ref: true, svgo: false, titleProp: true },
        include: "**/*.svg",
      }),
      eslintPlugin({ cache: false }),
      checker({
        typescript: true,
        overlay: false,
      }),
      dynamicBase({
        publicPath: " window.__dynamic_base__",
        transformIndexHtml: true,
      }),
    ],
  }
})
