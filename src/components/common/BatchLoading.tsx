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
