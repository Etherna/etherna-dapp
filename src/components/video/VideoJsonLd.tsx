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

import React, { useMemo } from "react"
import { JsonLd } from "react-schemaorg"
import type { VideoObject } from "schema-dts"

import dayjs from "@/utils/dayjs"
import { stripMarkdown } from "@/utils/markdown"
import { timeComponents } from "@/utils/time"

export type VideoJsonLdProps = {
  title: string
  duration: number
  keywords?: string
  canonicalUrl: string
  contentUrl: string
  embedUrl: string
  thumbnailUrl?: string
  description?: string
  datePublished?: Date
  dateUpdated?: Date
}

const VideoJsonLd: React.FC<VideoJsonLdProps> = ({
  title,
  duration,
  keywords,
  canonicalUrl,
  contentUrl,
  embedUrl,
  thumbnailUrl,
  description,
  datePublished,
  dateUpdated,
}) => {
  const ptDuration = useMemo(() => {
    const { hours, minutes, seconds } = timeComponents(duration)
    let pt = "PT"
    if (hours) pt += `${hours}H`
    if (minutes) pt += `${minutes}M`
    pt += `${seconds}S`
    return pt
  }, [duration])

  return (
    <JsonLd<VideoObject>
      item={{
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: title,
        description: description ? stripMarkdown(description) : undefined,
        keywords,
        thumbnailUrl,
        url: canonicalUrl,
        duration: ptDuration,
        datePublished: datePublished ? dayjs(datePublished).format("YYYY-MM-DD") : undefined,
        uploadDate: datePublished ? dayjs(datePublished).format("YYYY-MM-DD") : undefined,
        embedUrl,
        contentUrl,
      }}
    />
  )
}

export default VideoJsonLd
