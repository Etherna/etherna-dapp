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

import classes from "@/styles/components/studio/Storage.module.scss"
import { ReactComponent as Spinner } from "@/assets/animated/spinner.svg"

import StorageBatch from "./storage/StorageBatch"
import useSelector from "@/state/useSelector"
import Alert from "@/components/common/Alert"

const Storage: React.FC = () => {
  const isStandaloneGateway = useSelector(state => state.env.isStandaloneGateway)
  const batches = useSelector(state => state.user.batches)

  return (
    <div className={classes.storage}>
      {(isStandaloneGateway && batches?.length === 0) && (
        <Alert title="No storage found" type="danger">
          <p>
            {`You don't have any storage on this gateway, or
            the current gateway doesn't provide any.`}
          </p>
          <p>
            {`Without storage you won't be able to upload any data.`}
          </p>
        </Alert>
      )}
      {batches == null && (
        <p className={classes.storageLoading}>
          <Spinner aria-hidden /> We are loading your storage information
        </p>
      )}
      {(batches && !batches.length && !isStandaloneGateway) && (
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
