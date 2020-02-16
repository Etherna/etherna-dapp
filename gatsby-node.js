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

    if (page.path.match(/^\/watch\//)) {
        page.matchPath = "/watch/:id"

        // Update the page.
        createPage(page)
    }
}
