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

import { ExclamationCircleIcon, PlusIcon, SparklesIcon } from "@heroicons/react/24/solid"

import { Button } from "@/components/ui/actions"
import { ProgressBar } from "@/components/ui/display"

type BatchLoadingProps = {
  className?: string
  type: "fetching" | "creating" | "updating" | "saturated" | "not-found"
  title?: string
  message?: string
  error?: boolean | Error
  onCreate?(): void
}

const BatchLoading: React.FC<BatchLoadingProps> = ({
  className,
  type,
  title,
  message = "This process might take several seconds",
  error,
  onCreate,
}) => {
  return (
    <div
      className={classNames(
        "w-full max-w-sm self-start rounded bg-gray-100 p-4 dark:bg-gray-800",
        className
      )}
      data-component="batch-loading"
    >
      {!error && <ProgressBar className="mb-3" indeterminate />}
      <div className="flex items-center">
        {(error || type === "creating") && (
          <span
            className={classNames("mr-2 h-5 w-5 shrink-0", {
              "animate-pulse": type === "creating",
              "text-red-500": !!error,
            })}
          >
            {error ? (
              <ExclamationCircleIcon className="h-full w-full" aria-hidden />
            ) : type === "creating" ? (
              <SparklesIcon className="h-full w-full" aria-hidden />
            ) : null}
          </span>
        )}

        <h4 className="mb-0 font-semibold leading-none">
          {title
            ? title
            : error
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

      <p className="mt-2 text-sm opacity-50">
        {message ? message : typeof error === "object" ? JSON.stringify(error) : ""}
      </p>

      {(type === "fetching" || type === "not-found") && error && (
        <Button className="mt-4" color="inverted" small onClick={onCreate}>
          <PlusIcon aria-hidden />
          create new postage
        </Button>
      )}
    </div>
  )
}

export default BatchLoading
