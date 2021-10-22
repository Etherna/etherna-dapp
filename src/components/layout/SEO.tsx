/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import useSelector from "@state/useSelector"
import React from "react"
import { Helmet } from "react-helmet-async"

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
  const darkMode = useSelector(state => state.env.darkMode)
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
          name: `theme-color`,
          content: darkMode ? `#171717` : `#064E3B`,
        },
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
