import React from "react"
import Helmet from "react-helmet"

type SEOProps = {
  description?: string
  lang?: string
  title: string
  tagline?: string
  meta?: { name: string, content: string }[]
}

function SEO({
  description,
  lang = "en",
  meta = [],
  title,
  tagline
}: SEOProps) {
  const siteTitle = import.meta.env.VITE_APP_NAME
  const siteTagline = import.meta.env.VITE_APP_TAGLINE

  const metaDescription = description || siteTagline

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s – ${tagline || siteTitle}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: siteTitle,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ].concat(meta)}
    />
  )
}

export default SEO
