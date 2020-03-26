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
                    require(`tailwindcss`)(`./tailwind.config.js`),
                    require(`autoprefixer`),
                ],
            },
        },
        {
            resolve: `gatsby-plugin-purgecss`,
            options: {
                printRejected: true, // Print removed selectors and processed file names
                tailwind: true, // Enable tailwindcss support
                // whitelist: ['whitelist'], // Don't remove this selector
                ignore: ['src/components'], // Ignore files/folders
                // purgeOnly : ['components/', '/main.css', 'bootstrap/'], // Purge only these files/folders
            },
        },
        {
            resolve: 'gatsby-plugin-htaccess',
            options: {
                RewriteBase: true,
                https: true,
                //www: true,
                //host: 'www.app.etherna.io', // if 'www' is set to 'false', be sure to also remove it here!
                SymLinksIfOwnerMatch: true,
                ErrorDocument: `
                    ErrorDocument 401 /401/index.html
                    ErrorDocument 404 /404/index.html
                    ErrorDocument 500 /500/index.html
                `,
                custom: `
                    # Redirect channel editing urls
                    <IfModule mod_rewrite.c>
                        RewriteEngine On
                        RewriteBase /channel/(.+)/edit$
                        RewriteCond %{REQUEST_FILENAME} !-f
                        RewriteCond %{REQUEST_FILENAME} !-d
                        RewriteRule (.*) /channelEdit/index.html [QSA,L]
                    </IfModule>

                    # Redirect channel urls
                    <IfModule mod_rewrite.c>
                        RewriteEngine On
                        RewriteBase /channel
                        RewriteCond %{REQUEST_FILENAME} !-f
                        RewriteCond %{REQUEST_FILENAME} !-d
                        RewriteRule (.*) /channel/index.html [QSA,L]
                    </IfModule>
                `,
            },
        },
        // this (optional) plugin enables Progressive Web App + Offline functionality
        // To learn more, visit: https://gatsby.dev/offline
        // `gatsby-plugin-offline`,
    ],
}
