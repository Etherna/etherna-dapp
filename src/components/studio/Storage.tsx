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
import Alert from "@/components/common/Alert"
import useSelector from "@/state/useSelector"

const Storage: React.FC = () => {
  const isStandaloneGateway = useSelector(state => state.env.isStandaloneGateway)
  const defaultBatch = useSelector(state => state.user.defaultBatch)

  return (
    <div className={classes.storage}>
      {(!defaultBatch) && (
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
      {!defaultBatch && isStandaloneGateway && (
        <p className={classes.storageLoading}>
          <Spinner aria-hidden /> We are loading your storage information
        </p>
      )}
      {(!defaultBatch && !isStandaloneGateway) && (
        <p className={classes.storageLoading}>
          <Spinner aria-hidden /> We are creating your first storage on Etherna. Refresh this page in a few seconds.
        </p>
      )}
      {defaultBatch && (
        <ul className={classes.storageList}>
          <StorageBatch batch={defaultBatch} num={1} key={defaultBatch.id} />
        </ul>
      )}
    </div>
  )
}

export default Storage
