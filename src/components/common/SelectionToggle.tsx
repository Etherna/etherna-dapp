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
import { Switch } from "@headlessui/react"
import classNames from "classnames"

import classes from "@/styles/components/common/SelectionToggle.module.scss"
import { CheckIcon } from "@heroicons/react/solid"

type SelectionToggleProps = {
  className?: string
  label?: string
  description?: string
  checked: boolean
  onChange(checked: boolean): void
}

const SelectionToggle: React.FC<SelectionToggleProps> = ({
  className,
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <Switch.Group>
      <Switch
        checked={checked}
        onChange={onChange}
        className={classNames(classes.selectionToggle, className, {
          [classes.checked]: checked,
        })}
      >
        <div className={classes.selectionToggleCheck}>
          {checked && (
            <CheckIcon />
          )}
        </div>

        <div className={classes.selectionToggleText}>
          {label && (
            <Switch.Label className={classes.selectionToggleLabel}>{label}</Switch.Label>
          )}
          {description && (
            <Switch.Description className={classes.selectionToggleDescription}>
              {description}
            </Switch.Description>
          )}
        </div>
      </Switch>
    </Switch.Group>
  )
}

export default SelectionToggle