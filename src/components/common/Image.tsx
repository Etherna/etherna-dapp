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

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { extractReference } from "@etherna/api-js/utils"
import classNames from "classnames"
import { filterXSS } from "xss"

import useClientsStore from "@/stores/clients"

type ImageProps = {
  className?: string
  imgClassName?: string
  placeholderClassName?: string
  src?: string
  sources?: Partial<Record<`${number}w`, string>>
  fallbackSrc?: string
  blurredDataURL?: string
  aspectRatio?: number
  placeholder?: "empty" | "blur"
  layout?: "fill" | "responsive"
  objectFit?: "cover" | "contain"
  alt?: string
  style?: React.CSSProperties
}

const Image: React.FC<ImageProps> = ({
  className,
  imgClassName,
  placeholderClassName,
  src: staticSrc,
  sources,
  fallbackSrc,
  blurredDataURL,
  aspectRatio,
  placeholder = "empty",
  layout = "fill",
  objectFit = "cover",
  alt,
  style,
}) => {
  const beeClient = useClientsStore(state => state.beeClient)
  const [src, setSrc] = useState<string | undefined>(staticSrc)
  const [imgLoaded, setImgLoaded] = useState(!blurredDataURL || placeholder === "empty")
  const rootEl = useRef<HTMLDivElement>(null)
  const resizeObserver = useRef<ResizeObserver>()
  const sourcesSizes = useMemo(() => {
    return Object.keys(sources ?? {})
  }, [sources])

  if (layout === "responsive" && !aspectRatio) {
    throw new Error("Image with layout='responsive' must set an aspectRatio")
  }

  useEffect(() => {
    if (rootEl.current && layout === "responsive" && sourcesSizes.length) {
      resizeObserver.current = new ResizeObserver(onContainerResize)
      resizeObserver.current.observe(rootEl.current)
    }
    return () => {
      resizeObserver.current?.disconnect()
      resizeObserver.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootEl.current, layout, sourcesSizes])

  useEffect(() => {
    updateCurrentSrc()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticSrc, sources, rootEl.current])

  const getOptimizedSrc = useCallback(
    (sources: ImageProps["sources"], size: number): string => {
      if (!sources) throw new Error("Missing sources")
      const screenSize = size * (window.devicePixelRatio ?? 1)
      const sizes = Object.keys(sources)
        .map(size => parseInt(size))
        .sort()
      const largest = sizes[sizes.length - 1]
      const largestReference = extractReference(sources[`${largest}w`]!)

      if (size > largest) return beeClient.bzz.url(largestReference)

      const optimized = sizes.find(size => size > screenSize)
      const optimizedReference = optimized
        ? extractReference(sources[`${optimized}w`]!)
        : largestReference
      return optimizedReference ? beeClient.bzz.url(optimizedReference) : ""
    },
    [beeClient]
  )

  const updateCurrentSrc = useCallback(() => {
    if (!rootEl.current) return

    if (sources) {
      const newSrc = getOptimizedSrc(sources, rootEl.current.clientWidth)
      setSrc(newSrc)
      newSrc !== src && setImgLoaded(false)
    } else {
      setSrc(staticSrc ?? fallbackSrc)
    }
  }, [src, sources, staticSrc, fallbackSrc, getOptimizedSrc])

  const onContainerResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (layout === "responsive") {
        updateCurrentSrc()
      }
    },
    [layout, updateCurrentSrc]
  )

  const onLoadImage = useCallback(() => {
    setImgLoaded(true)
  }, [])

  const onError = useCallback(() => {
    if (!fallbackSrc) return setImgLoaded(true)

    if (src !== fallbackSrc) {
      setSrc(fallbackSrc)
    } else {
      setImgLoaded(true)
    }
  }, [fallbackSrc, src])

  return (
    <div
      className={classNames(
        {
          relative: layout !== "fill",
          "absolute inset-0": layout === "fill",
          "w-full": layout === "responsive",
        },
        className
      )}
      style={{
        paddingBottom:
          layout === "responsive" ? `${Math.round((1 / aspectRatio!) * 100)}%` : undefined,
      }}
      ref={rootEl}
      data-component="image"
    >
      {src && (
        <picture onError={onError} onLoad={onLoadImage}>
          <img
            className={classNames("absolute inset-0 h-full w-full", imgClassName)}
            src={filterXSS(src)}
            alt={alt}
            style={{
              ...style,
              objectFit,
            }}
            loading="lazy"
          />
        </picture>
      )}
      <div
        className={classNames(
          "absolute inset-0 transition-opacity duration-300",
          "bg-gray-400 bg-cover bg-no-repeat dark:bg-gray-600",
          {
            "opacity-0": imgLoaded,
          },
          placeholderClassName
        )}
        style={{
          ...style,
          objectFit,
          backgroundImage:
            placeholder === "blur" && blurredDataURL ? `url(${blurredDataURL})` : undefined,
        }}
      />
    </div>
  )
}

export default Image
