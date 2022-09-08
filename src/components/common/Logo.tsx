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
import { omit } from "lodash"

import { ReactComponent as EthernaSymbol } from "@/assets/logo-symbol.svg"
import { ReactComponent as EthernaLogo } from "@/assets/logo.svg"

type LogoProps = React.SVGAttributes<SVGElement> & {
  compact?: boolean
  forceWhite?: boolean
}

const Logo: React.FC<LogoProps> = props => {
  return props.compact ? (
    <EthernaSymbol
      aria-label="Etherna"
      {...omit(props, "compact", "white")}
      className={classNames(
        "[&>.svg-symbol]:fill-primary-500 [&>.svg-symbol]:dark:fill-gray-50",
        {
          dark: props.forceWhite,
        },
        props.className
      )}
    />
  ) : (
    <EthernaLogo
      aria-label="Etherna"
      {...omit(props, "compact", "white")}
      className={classNames(
        "[&>.svg-symbol]:fill-primary-500 [&>.svg-symbol]:dark:fill-gray-50",
        "[&>.svg-text]:fill-[#7797A3] [&>.svg-text]:dark:fill-gray-50",
        {
          dark: props.forceWhite,
        },
        props.className
      )}
    />
  )
}

export default Logo
