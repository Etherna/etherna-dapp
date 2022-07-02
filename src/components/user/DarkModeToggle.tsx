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

import { MoonIcon, SunIcon } from "@heroicons/react/outline"

import Toggle from "@/components/common/Toggle"

type DarkModeToggleProps = {
  enabled: boolean
  onChange(enabled: boolean): void
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ enabled, onChange }) => {
  return (
    <div className="flex w-full items-center">
      Dark Mode

      <Toggle
        className="ml-auto"
        checkedIcon={<MoonIcon />}
        uncheckedIcon={<SunIcon />}
        checked={enabled}
        onChange={onChange}
      />
    </div>
  )
}

export default DarkModeToggle
