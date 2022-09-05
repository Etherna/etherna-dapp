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
import ReactSliderLib from "react-slider"
import type { ReactSliderProps } from "react-slider"
import classNames from "classnames"

const ReactSlider = ReactSliderLib as unknown as React.FC<ReactSliderProps>

const SimpleSlider: React.FC<ReactSliderProps> = props => {
  return (
    <ReactSlider
      {...props}
      className={classNames("w-full h-5", props.className)}
      renderTrack={(_, { index, value }) => (
        <div
          className={classNames("bg-gray-300 dark:bg-gray-600 h-1 rounded-full mt-2", {
            "bg-gray-800 dark:bg-gray-50": index === 0,
          })}
          style={{
            position: "absolute",
            left: index === 0 ? 0 : `${value}%`,
            right: index === 1 ? 0 : `${100 - value}%`,
          }}
          key={index}
        />
      )}
      thumbClassName="w-2 h-full rounded-full bg-gray-800 dark:bg-gray-200"
    />
  )
}

const Slider: React.FC<ReactSliderProps> & {
  Simple: typeof SimpleSlider
} = props => {
  return <ReactSlider {...props} />
}
Slider.Simple = SimpleSlider

export default Slider
