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
import classNames from "classnames"

import classes from "@styles/components/common/Placeholder.module.scss"

type PlaceholderProps = {
  width?: string
  height?: string
  ratio?: number
  round?: "" | "sm" | "default" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full" | "none" | boolean
  className?: string
}

const Placeholder = ({
  width,
  height,
  ratio,
  round,
  className
}: PlaceholderProps) => {
  return (
    <div
      className={classNames(classes.placeholder, className, {
        "rounded": round === "default" || round === true,
        "rounded-none": round === "none",
        "rounded-sm": round === "sm",
        "rounded-md": round === "md",
        "rounded-lg": round === "lg",
        "rounded-xl": round === "xl",
        "rounded-2xl": round === "2xl",
        "rounded-full": round === "full",
      })}
      style={{
        width,
        height: ratio ? "" : height,
        paddingTop: ratio ? `calc(${width} * ${ratio})` : ""
      }}
    />
  )
}

export default Placeholder
