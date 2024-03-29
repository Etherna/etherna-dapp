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

import Text from "@/components/ui/display/Text"
import { cn } from "@/utils/classnames"

type FieldDescriptionProps = {
  children?: React.ReactNode
  className?: string
  smaller?: boolean
}

const FieldDescription: React.FC<FieldDescriptionProps> = ({ children, className, smaller }) => {
  return (
    <Text
      size="xs"
      className={cn(
        "mt-1.5 text-gray-500 dark:text-gray-400",
        {
          "max-w-md": !smaller,
          "max-w-xs": smaller,
        },
        className
      )}
      data-component="field-description"
    >
      {children}
    </Text>
  )
}

export default FieldDescription
