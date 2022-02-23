import React from "react"

import classes from "@styles/components/studio/Storage.module.scss"
import { ReactComponent as Spinner } from "@assets/animated/spinner.svg"

import StorageBatch from "./storage/StorageBatch"
import useSelector from "@state/useSelector"

const Storage: React.FC = () => {
  const { batches } = useSelector(state => state.user)

  return (
    <div className={classes.storage}>
      {batches == null && (
        <p className={classes.storageLoading}>
          <Spinner aria-hidden /> We are loading your storage information
        </p>
      )}
      {(batches && !batches.length) && (
        <p className={classes.storageLoading}>
          <Spinner aria-hidden /> We are creating your first storage on Etherna. Refresh this page in a few seconds.
        </p>
      )}
      {batches && (
        <ul className={classes.storageList}>
          {batches.map((batch, i) => (
            <StorageBatch batch={batch} num={i + 1} key={batch.id} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default Storage
