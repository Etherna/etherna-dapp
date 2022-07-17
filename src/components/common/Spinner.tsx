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
  size?: number | string
}

const ticksCount = 12

const Spinner: React.FC<SpinnerProps> = ({ size, className }) => {
  const ticks = new Array(ticksCount).fill(0)
  return (
    <div
      className={classNames(classes.spinner, className)}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size
      }}
    >
      {ticks.map((_, i) => {
        return (
          <div
            className={classes.spinnerTick}
            key={i}
          />
        )
      })}
    </div>
  )
}

export default Spinner
