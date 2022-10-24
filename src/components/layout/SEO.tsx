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

import React from "react"
import { Helmet } from "react-helmet-async"
import type { MetaProps } from "react-helmet-async"

import Head from "./Head"
import useSettingsStore from "@/stores/settings"

type SEOProps = {
  children?: React.ReactNode
  description?: string
  lang?: string
  title: string
  canonicalUrl?: string
  meta?: { name: string; content: string }[]
  type?: "website" | "video.other"
  image?: string
}

const SEO: React.FC<SEOProps> = ({
  children,
  description,
  lang = "en",
  meta = [],
  title,
  canonicalUrl,
  type = "website",
  image,
}) => {
  const darkMode = useSettingsStore(state => state.darkMode)
  const siteTitle = import.meta.env.VITE_APP_NAME
  const siteTagline = import.meta.env.VITE_APP_TAGLINE

  return (
    <>
      <Helmet
        htmlAttributes={{
          lang,
        }}
        title={title}
        titleTemplate={`%s | ${title === siteTitle ? siteTagline : siteTitle}`}
        meta={
          [
            {
              name: `theme-color`,
              content: darkMode ? `#111827` : `#f9fafb`,
            },
            description && {
              name: `description`,
              content: description,
            },
            {
              property: `og:title`,
              content: title,
            },
            description && {
              property: `og:description`,
              content: description,
            },
            image && {
              property: `og:image`,
              content: image,
            },
            type && {
              property: `og:type`,
              content: type,
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
            description && {
              name: `twitter:description`,
              content: description,
            },
          ]
            .filter(Boolean)
            .concat(meta) as MetaProps[]
        }
      >
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Helmet>

      <Head>{children}</Head>
    </>
  )
}

export default SEO
