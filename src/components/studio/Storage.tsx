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
