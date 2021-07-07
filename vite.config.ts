import fs from "fs"
import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import svgr from "vite-plugin-svgr"
import tsconfigPaths from "vite-tsconfig-paths"
import eslintPlugin from "vite-plugin-eslint"
import { getAliases } from "vite-aliases"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    manifest: true,
    outDir: "build",
  },
  resolve: {
    alias: getAliases({
      deep: false,
    }),
  },
  server: {
    https: {
      key: fs.readFileSync("server/sslcert/key.pem"),
      cert: fs.readFileSync("server/sslcert/cert.pem"),
    },
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
})
