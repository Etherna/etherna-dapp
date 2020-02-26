import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

/*
 * This component is built using `gatsby-image` to automatically serve optimized
 * images with lazy loading and reduced file sizes. The image is loaded using a
 * `useStaticQuery`, which allows us to load the image from directly within this
 * component, rather than having to pass the image data down from pages.
 *
 * For more information, see the docs:
 * - `gatsby-image`: https://gatsby.dev/gatsby-image
 * - `useStaticQuery`: https://www.gatsbyjs.org/docs/use-static-query/
 */

const Image = ({ filename, alt, width, className }) => (
    <StaticQuery
        query={graphql`
            query {
                images: allFile {
                    edges {
                        node {
                            relativePath
                            name
                            extension
                            publicURL
                            childImageSharp {
                                sizes(maxWidth: 600) {
                                    ...GatsbyImageSharpSizes
                                }
                            }
                        }
                    }
                }
            }
        `}
        render={data => {
            const image = data.images.edges.find(n => {
                return n.node.relativePath.includes(filename)
            })
            if (!image) {
                return null
            }

            if (!image.node.childImageSharp && image.node.extension === "svg") {
                return (
                    <img
                        src={image.node.publicURL}
                        alt={alt}
                        className={className}
                        width={width || null}
                    />
                )
            }

            const imageSizes = image.node.childImageSharp.sizes
            return <Img alt={alt} sizes={imageSizes} />
        }}
    />
)

Image.propTypes = {
    filename: PropTypes.string.isRequired,
    alt: PropTypes.string,
    width: PropTypes.number,
    minWidth: PropTypes.number,
    className: PropTypes.string,
}

export default Image
