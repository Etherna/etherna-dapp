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

    if (page.path.match(/^\/profileEdit\//)) {
        page.matchPath = "/profile/:id/edit"

        // Update the page.
        createPage(page)
    }

    if (page.path.match(/^\/profile\//)) {
        page.matchPath = "/profile/:id"

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
                "@utils": path.resolve(__dirname, "src/utils"),
            },
        },
    })
}
