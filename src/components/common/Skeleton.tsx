import React from "react"
import classNames from "classnames"

import classes from "@/styles/components/common/Skeleton.module.scss"

type SkeletonProps = {
  children: React.ReactNode
  className?: string
  show?: boolean
  rounded?: boolean
  squared?: boolean
  width?: string | number
  height?: string | number
}

const Skeleton: React.FC<SkeletonProps> = ({
  children,
  className,
  show = true,
  rounded,
  squared,
  width,
  height,
}) => {
  if (!show) return <>{children}</>

  return (
    <span
      className={classNames(classes.skeleton, className, {
        "rounded-md": !squared && !rounded,
        "rounded-full": rounded,
      })}
      style={{
        width,
        height,
      }}
    >
      {children}
    </span>
  )
}

export default Skeleton
