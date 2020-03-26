/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

///
/// Custom routes
///
exports.onCreatePage = async ({ page, actions }) => {
    const { createPage } = actions

    if (page.path.match(/^\/channelEdit\//)) {
        page.matchPath = "/channel/:id/edit"

        // Update the page.
        createPage(page)
    }

    if (page.path.match(/^\/channel\//)) {
        page.matchPath = "/channel/:id"

        // Update the page.
        createPage(page)
    }
}

///
/// Webpack extension
///
const path = require("path")
exports.onCreateWebpackConfig = ({ actions }) => {
    actions.setWebpackConfig({
        resolve: {
            alias: {
                "@components": path.resolve(__dirname, "src/components"),
                "@common": path.resolve(__dirname, "src/components/common"),
                "@routes": path.resolve(__dirname, "src/routes"),
                "@state": path.resolve(__dirname, "src/state"),
                "@svg": path.resolve(__dirname, "src/svg"),
                "@utils": path.resolve(__dirname, "src/utils"),
            },
        },
    })
}

///
/// Config ENV
///
require("dotenv").config({
    path: `.env.${process.env.NODE_ENV}`,
})
