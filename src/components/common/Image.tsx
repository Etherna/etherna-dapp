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

import React, { useEffect, useRef, useState } from "react"
import classNames from "classnames"

import classes from "@styles/components/common/Image.module.scss"

import useSelector from "@state/useSelector"

type ImageProps = {
  src?: string
  sources?: Record<`${number}w`, string>
  fallbackSrc?: string
  blurredDataURL?: string
  aspectRatio?: number
  placeholder?: "empty" | "blur"
  layout?: "fill" | "responsive"
  objectFit?: "cover" | "contain"
  alt?: string
  className?: string
  placeholderClassName?: string
  style?: React.CSSProperties
}

const Image: React.FC<ImageProps> = ({
  src: staticSrc,
  sources,
  fallbackSrc,
  blurredDataURL,
  aspectRatio,
  placeholder = "empty",
  layout = "fill",
  objectFit = "cover",
  alt,
  className,
  placeholderClassName,
  style
}) => {
  const beeClient = useSelector(state => state.env.beeClient)
  const [src, setSrc] = useState<string | undefined>(staticSrc)
  const [imgLoaded, setImgLoaded] = useState(!blurredDataURL || placeholder === "empty")
  const [rootEl, setRootEl] = useState<HTMLDivElement>()
  const resizeObserver = useRef<ResizeObserver>()
  const sourcesSizes = Object.keys(sources ?? {})

  if (layout === "responsive" && !aspectRatio) {
    throw new Error("Image with layout='responsive' must set an aspectRatio")
  }

  useEffect(() => {
    if (rootEl && layout === "responsive" && sourcesSizes.length) {
      resizeObserver.current = new ResizeObserver(onContainerResize)
      resizeObserver.current.observe(rootEl)
    }
    return () => {
      resizeObserver.current?.disconnect()
      resizeObserver.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootEl, layout, sourcesSizes])

  useEffect(() => {
    updateCurrentSrc()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticSrc, sources, rootEl])

  const onContainerResize = (entries: ResizeObserverEntry[]) => {
    if (layout === "responsive") {
      updateCurrentSrc()
    }
  }

  const updateCurrentSrc = () => {
    if (!rootEl) return

    if (sources) {
      const src = getOptimizedSrc(sources, rootEl.clientWidth)
      setSrc(src)
      setImgLoaded(false)
    } else {
      setSrc(staticSrc)
    }
  }

  const onLoadImage = () => {
    setTimeout(() => {
      setImgLoaded(true)
    }, 500)
  }

  const onError = () => {
    if (!fallbackSrc) return setImgLoaded(true)

    if (src !== fallbackSrc) {
      setSrc(fallbackSrc)
    } else {
      setImgLoaded(true)
    }
  }

  const getOptimizedSrc = (sources: Record<`${number}w`, string>, size: number): string => {
    const screenSize = size * (window.devicePixelRatio ?? 1)
    const sizes = Object.keys(sources).map(size => parseInt(size)).sort()
    const largest = sizes[sizes.length - 1]

    if (size > largest) return beeClient.getBzzUrl(sources[`${largest}w`])

    const optimized = sizes.find(size => size > screenSize)
    const optimizedReference = optimized ? sources[`${optimized}w`] : sources[`${largest}w`]
    return optimizedReference ? beeClient.getBzzUrl(optimizedReference) : ""
  }

  return (
    <div
      className={classNames(classes.image, className, {
        [classes.fill]: layout === "fill",
        [classes.responsive]: layout === "responsive",
        [classes.loaded]: imgLoaded
      })}
      style={{
        paddingBottom: layout === "responsive" ? `${Math.round(1 / aspectRatio! * 100)}%` : undefined
      }}
      ref={el => el && setRootEl(el)}
    >
      {src && (
        <picture
          className={classes.imagePicture}
          onError={onError}
          onLoad={onLoadImage}
        >
          <img
            src={src}
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
        className={classNames(classes.imagePlaceholder, placeholderClassName)}
        style={{
          ...style,
          objectFit,
          backgroundImage: placeholder === "blur" && blurredDataURL ? `url(${blurredDataURL})` : undefined,
        }}
      />
    </div>
  )
}

export default Image