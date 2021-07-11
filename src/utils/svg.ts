import React from "react"
import ReactDOMServer from "react-dom/server"

/**
 * Encode a SVG React component in base64 string
 * @param svgComponent The SVG React component
 * @returns The base64 string
 */
export const encodedSvg = (svgComponent: React.ReactElement) => {
  return "data:image/svg+xml," + escape(ReactDOMServer.renderToStaticMarkup((svgComponent)))
}
