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

import classes from "@styles/components/common/Alert.module.scss"

type AlertProps = {
  title?: string
  className?: string
  type: "success" | "danger" | "warning" | "info"
  onClose?: () => void
}

const Alert: React.FC<AlertProps> = ({
  children,
  type = "info",
  className,
  title,
  onClose,
}) => {
  return (
    <div
      className={classNames(classes.alert, className, {
        [classes.alertSuccess]: type === "success",
        [classes.alertDanger]: type === "danger",
        [classes.alertWarning]: type === "warning",
        [classes.alertInfo]: type === "info",
      })}
    >
      <div className={classes.alertHeader}>
        {title && <div className={classes.alertTitle}>{title}</div>}

        {onClose && (
          <button className={classes.close} onClick={onClose}>
            <span className="m-auto" aria-hidden="true">
              &times;
            </span>
          </button>
        )}
      </div>
      <div className={classes.alertBody}>{children}</div>
    </div>
  )
}

export default Alert
