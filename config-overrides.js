const {
    override,
    addWebpackAlias,
    addPostcssPlugins
} = require("customize-cra")
const path = require("path")
const purgecss = require("@fullhuman/postcss-purgecss")({
    content: [
        "./src/**/*.js",
        '!./src/components'
    ],
    // Include any special characters you're using in this regular expression
    //defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
})

module.exports = override(
    addPostcssPlugins([
        require('tailwindcss')("./tailwind.config.js"),
        require("autoprefixer"),
        ...process.env.NODE_ENV === "production"
            ? [purgecss]
            : []
    ]),

    addWebpackAlias({
        "@app": path.resolve(__dirname, "src/app"),
        "@components": path.resolve(__dirname, "src/components"),
        "@common": path.resolve(__dirname, "src/components/common"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@routes": path.resolve(__dirname, "src/routes"),
        "@state": path.resolve(__dirname, "src/state"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@svg": path.resolve(__dirname, "src/svg"),
    }),
)