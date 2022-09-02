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

import classes from "@/styles/components/common/Spinner.module.scss"

export type SpinnerProps = {
  className?: string
  type?: "spinner" | "bouncing-line"
  size?: number | string
  height?: number | string
}

const ticksCount = 12

const Spinner: React.FC<SpinnerProps> = ({
  className,
  size,
  height,
  type = "spinner",
}) => {
  switch (type) {
    case "spinner":
      return (
        <div
          className={classNames(classes.spinner, className)}
          style={{
            fontSize: typeof size === "number" ? `${size}px` : size
          }}
        >
          {Array(ticksCount).fill(0).map((_, i) => {
            return (
              <div
                className={classes.spinnerTick}
                key={i}
              />
            )
          })}
        </div>
      )
    case "bouncing-line":
      return (
        <div
          className={classNames(classes.spinnerLine, className)}
          style={{ width: size, height }}
        >
          <span className={classes.spinnerLineTick} />
        </div>
      )
  }
}

export default Spinner
