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
import stringHash from "string-hash"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"
import eslintPlugin from "vite-plugin-eslint"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    manifest: true,
    outDir: "build",
  },
  server: {
    https: fs.existsSync("proxy/sslcert/key.pem") && fs.existsSync("proxy/sslcert/cert.pem") && {
      key: fs.readFileSync("proxy/sslcert/key.pem"),
      cert: fs.readFileSync("proxy/sslcert/cert.pem"),
    },
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
    alias: {
      "stream": "stream-browserify",
    },
  },
  plugins: [
    tsconfigPaths({ root: "." }),
    react(),
    svgr(),
    eslintPlugin({ cache: false }),
    VitePWA({
      registerType: "prompt",
      manifest: {
        short_name: "Etherna",
        name: "Etherna",
        icons: [
          {
            "src": "images/icon.png",
            "sizes": "64x64",
            "type": "image/png"
          },
          {
            "src": "images/icon-192.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "images/icon-512.png",
            "type": "image/png",
            "sizes": "512x512"
          }
        ],
        display: "standalone",
        background_color: "#f9fafb",
        theme_color: "#03CEA4",
        start_url: ".",
        lang: "en"
      },
    }),
  ],
}))
