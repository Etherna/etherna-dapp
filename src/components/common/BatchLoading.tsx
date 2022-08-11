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

import classes from "@/styles/components/common/BatchLoading.module.scss"
import { SparklesIcon, ExclamationCircleIcon } from "@heroicons/react/solid"

import ProgressBar from "./ProgressBar"

type BatchLoadingProps = {
  className?: string
  type: "fetching" | "creating" | "updating"
  title?: string
  message?: string
  error?: string
}

const BatchLoading: React.FC<BatchLoadingProps> = ({
  className,
  type,
  message = "This process might take several seconds",
  error,
}) => {
  return (
    <div
      className={classNames(classes.batchLoading, className, {
        [classes.creating]: type === "creating",
        [classes.error]: !!error,
      })}
    >
      {!error && (
        <ProgressBar className={classes.batchLoadingProgress} indeterminate />
      )}
      <div className={classes.batchLoadingHeading}>
        {error ? (
          <ExclamationCircleIcon className={classes.batchLoadingIcon} aria-hidden />
        ) : type === "creating" ? (
          <SparklesIcon className={classes.batchLoadingIcon} aria-hidden />
        ) : (
          null
        )}

        <h4 className={classes.batchLoadingTitle}>
          {error
            ? `Couldn't ${type === "fetching" ? "fetch" : type === "updating" ? "update" : "create"} the postage batch`
            : type === "fetching" ? "Loading postage batch"
              : type === "updating" ? "Updating postage batch"
                : "Creating postage batch"}
        </h4>
      </div>

      <p className={classes.batchLoadingMessage}>
        {typeof error === "object" ? JSON.stringify(error) : error || message}
      </p>
    </div>
  )
}

export default BatchLoading
