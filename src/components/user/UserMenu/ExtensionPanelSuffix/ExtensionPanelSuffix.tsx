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
import classnames from "classnames"

import "./extension-panel-suffix.scss"

type ExtensionPanelSuffixProps = {
  active: boolean
}

const ExtensionPanelSuffix: React.FC<ExtensionPanelSuffixProps> = ({ active }) => {
  return (
    <div className="extension-panel-suffix">
      <span className={classnames("extension-panel-suffix-status", { active })} />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className="extension-panel-suffix-icon"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          // eslint-disable-next-line max-len
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}

export default ExtensionPanelSuffix
