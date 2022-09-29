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

import React, { useMemo } from "react"
import classNames from "classnames"

import { InformationCircleIcon } from "@heroicons/react/24/outline"
import { ExclamationCircleIcon, PlusIcon, SparklesIcon } from "@heroicons/react/24/solid"

import { Button } from "@/components/ui/actions"
import { ProgressBar } from "@/components/ui/display"

export type BatchLoadingType =
  | "fetching"
  | "creating"
  | "updating"
  | "propagation"
  | "saturated"
  | "not-found"

type BatchLoadingProps = {
  className?: string
  type: BatchLoadingType
  title?: string
  message?: string
  error?: boolean | Error
  onCreate?(): void
}

const BatchLoading: React.FC<BatchLoadingProps> = ({
  className,
  type,
  title,
  message,
  error,
  onCreate,
}) => {
  const defaultTitle = useMemo(() => {
    switch (type) {
      case "fetching":
        return error ? "Coudn't load the postage batch" : "Loading postage batch"
      case "creating":
        return error ? "Coudn't create the postage batch" : "Creating postage batch"
      case "updating":
        return error ? "Coudn't update the postage batch" : "Updating postage batch"
      case "propagation":
        return error ? "Coudn't update the postage batch" : "Waiting for batch propagation"
      case "saturated":
        return "Postage batch is saturated"
      case "not-found":
        return "Coudn't find postage batch"
    }
  }, [type, error])

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

        <h4 className="mb-0 font-semibold leading-none">{defaultTitle}</h4>
      </div>

      {type === "propagation" && (
        <p className="mt-3 text-sm leading-none">
          <InformationCircleIcon width={16} className="mr-1 inline" />
          This process might take several minutes...
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm opacity-50">
          {message ? message : typeof error === "object" ? JSON.stringify(error) : ""}
        </p>
      )}

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
