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

import "./alert.scss"

type AlertProps = {
  children: React.ReactNode
  title?: string
  type: "success" | "danger" | "warning" | "info"
  onClose?: () => void
}

const Alert = ({ children, type = "info", title, onClose }: AlertProps) => {
  return (
    <div
      className={classnames("alert", {
        [`alert-${type}`]: type,
      })}
    >
      <div className="alert-header">
        {title && <div className="alert-title">{title}</div>}

        {onClose && (
          <button className="close" onClick={onClose}>
            <span className="m-auto" aria-hidden="true">
              &times;
            </span>
          </button>
        )}
      </div>
      <p>{children}</p>
    </div>
  )
}

export default Alert
