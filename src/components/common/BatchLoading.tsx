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

import { ExclamationCircleIcon, PlusIcon, SparklesIcon } from "@heroicons/react/solid"

import { Button } from "@/components/ui/actions"
import { ProgressBar } from "@/components/ui/display"

type BatchLoadingProps = {
  className?: string
  type: "fetching" | "creating" | "updating" | "error"
  title?: string
  message?: string
  error?: string
  onCreate?(): void
}

const BatchLoading: React.FC<BatchLoadingProps> = ({
  className,
  type,
  message = "This process might take several seconds",
  error,
  onCreate,
}) => {
  return (
    <div
      className={classNames(
        "w-full max-w-sm self-start bg-gray-100 dark:bg-gray-800 rounded p-4",
        className
      )}
      data-component="batch-loading"
    >
      {!error && <ProgressBar className="mb-3" indeterminate />}
      <div className="flex items-center">
        <span
          className={classNames("w-5 h-5 mr-2", {
            "animate-pulse": type === "creating",
            "text-red-500": !!error,
          })}
        >
          {error ? (
            <ExclamationCircleIcon className="w-full h-full" aria-hidden />
          ) : type === "creating" ? (
            <SparklesIcon className="w-full h-full" aria-hidden />
          ) : null}
        </span>

        <h4 className="font-semibold mb-0">
          {error
            ? `Couldn't ${
                type === "fetching" ? "fetch" : type === "updating" ? "update" : "create"
              } the postage batch`
            : type === "fetching"
            ? "Loading postage batch"
            : type === "updating"
            ? "Updating postage batch"
            : "Creating postage batch"}
        </h4>
      </div>

      <p className="text-sm opacity-50 mt-2">
        {typeof error === "object" ? JSON.stringify(error) : error || message}
      </p>

      {type === "fetching" && error && (
        <Button className="mt-4" color="inverted" small onClick={onCreate}>
          <PlusIcon aria-hidden />
          create new batch
        </Button>
      )}
    </div>
  )
}

export default BatchLoading
