module.exports = {
    siteMetadata: {
        title: `Etherna`,
        description: `Transparent video platform`,
        author: `etherna.io`,
    },
    plugins: [
        `gatsby-plugin-react-helmet`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `images`,
                path: `${__dirname}/src/images`,
            },
        },
        `gatsby-transformer-sharp`,
        `gatsby-plugin-sharp`,
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: `gatsby-starter-default`,
                short_name: `starter`,
                start_url: `/`,
                background_color: `#34BA9C`,
                theme_color: `#34BA9C`,
                display: `minimal-ui`,
                icon: `src/images/icon.png`, // This path is relative to the root of the site.
            },
        },
        {
            resolve: `gatsby-plugin-sass`,
            options: {
                postCssPlugins: [
                    require("tailwindcss"),
                    require("./tailwind.config.js"), // Optional: Load custom Tailwind CSS configuration
                ],
            },
        },
        // this (optional) plugin enables Progressive Web App + Offline functionality
        // To learn more, visit: https://gatsby.dev/offline
        // `gatsby-plugin-offline`,
    ],
}
