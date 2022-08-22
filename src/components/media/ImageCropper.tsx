import React, { useCallback, useRef, useState } from "react"
import ReactCrop, { centerCrop, Crop, makeAspectCrop } from "react-image-crop"

import classes from "@/styles/components/media/ImageCropper.module.scss"

import Slider from "@/components/common/Slider"
import classNames from "classnames"

type ImageCropperProps = {
  className?: string
  imageSrc: string | undefined
  circular?: boolean
  aspectRatio?: number
  onChange(crop: Crop): void
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  className,
  imageSrc,
  circular,
  aspectRatio = 1,
  onChange,
}) => {
  const [crop, setCrop] = useState<Crop>()
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const image = useRef<HTMLImageElement>()
  const dragStart = useRef<[x: number, y: number]>()

  const imageLoaded = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    image.current = e.currentTarget

    const { width, height } = e.currentTarget

    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "px",
          width: width * (circular ? 0.75 : 1),
          height: height * (circular ? 0.75 : 1),
        },
        aspectRatio,
        width,
        height,
      ),
      width,
      height,
    )

    setCrop(crop)
  }, [aspectRatio, circular])

  const applyCropScreenScale = useCallback((crop: Crop) => {
    const scaleX = image.current!.naturalWidth / image.current!.width
    const scaleY = image.current!.naturalHeight / image.current!.height

    return {
      unit: "px",
      width: crop.width * scaleX,
      height: crop.height * scaleY,
      x: crop.x * scaleX,
      y: crop.y * scaleY,
    } as Crop
  }, [])

  const applyCropTransform = useCallback((
    scale: number,
    translateX: number,
    translateY: number
  ) => {
    const width = ((image.current!.width * 0.75) / scale)
    const height = ((image.current!.height * 0.75) / scale)
    const x = (image.current!.width - width) * 0.5 - translateX
    const y = (image.current!.height - height) * 0.5 - translateY

    return applyCropScreenScale({
      unit: "px",
      width,
      height,
      x,
      y,
    })
  }, [applyCropScreenScale])

  const onCropChange = useCallback((crop: Crop | undefined, scale: number) => {
    if (crop) {
      setCrop(crop)
      setScale(scale)
      onChange(
        circular
          ? applyCropTransform(scale, translateX, translateY)
          : applyCropScreenScale(crop)
      )
    }
  }, [circular, translateX, translateY, onChange, applyCropTransform, applyCropScreenScale])

  const onCropMove = useCallback((translateX: number, translateY: number) => {
    if (crop) {
      onChange(applyCropTransform(scale, translateX, translateY))
    }
  }, [crop, scale, onChange, applyCropTransform])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragStart.current = [e.clientX, e.clientY]
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!dragStart.current) return
    const x = translateX + e.clientX - dragStart.current[0]
    const y = translateY + e.clientY - dragStart.current[1]
    image.current!.style.transform = `scale(${scale}) translateX(${x}px) translateY(${y}px)`
  }, [scale, translateX, translateY])

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return
    const x = translateX + e.clientX - dragStart.current[0]
    const y = translateY + e.clientY - dragStart.current[1]
    setTranslateX(x)
    setTranslateY(y)
    onCropMove(x, y)
    dragStart.current = undefined
  }, [onCropMove, translateX, translateY])

  return (
    <div
      className={classNames(classes.imageCropper, className, {
        [classes.circular]: circular,
      })}
    >
      <ReactCrop
        crop={crop}
        aspect={aspectRatio}
        circularCrop={circular}
        disabled={circular}
        onChange={crop => onCropChange(crop, scale)}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            onLoad={imageLoaded}
            style={{
              transform: `scale(${scale}) translateX(${translateX}px) translateY(${translateY}px)`
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          />
        )}
      </ReactCrop>

      {circular && (
        <div className="mt-2">
          <Slider
            className="simple-slider"
            min={0.2}
            max={3}
            value={scale}
            step={0.01}
            onChange={scale => onCropChange(crop, scale)}
          />
        </div>
      )}
    </div>
  )
}

export default ImageCropper
