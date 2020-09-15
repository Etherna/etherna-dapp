const { override, addWebpackAlias, addPostcssPlugins } = require("customize-cra")
const path = require("path")

module.exports = override(
  addPostcssPlugins([
    require("tailwindcss")("./tailwind.config.js"),
    require("autoprefixer"),
    //...(process.env.NODE_ENV === "production" ? [purgecss] : []),
  ]),

  addWebpackAlias({
    "@app": path.resolve(__dirname, "src/app"),
    "@components": path.resolve(__dirname, "src/components"),
    "@common": path.resolve(__dirname, "src/components/common"),
    "@keyboard": path.resolve(__dirname, "src/keyboard"),
    "@icons": path.resolve(__dirname, "src/components/icons"),
    "@lang": path.resolve(__dirname, "src/lang"),
    "@pages": path.resolve(__dirname, "src/pages"),
    "@routes": path.resolve(__dirname, "src/routes"),
    "@state": path.resolve(__dirname, "src/state"),
    "@utils": path.resolve(__dirname, "src/utils"),
    "@svg": path.resolve(__dirname, "src/svg"),
  })
)
