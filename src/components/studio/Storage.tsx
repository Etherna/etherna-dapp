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
  const gatewayType = useSelector(state => state.env.gatewayType)
  const { batches, defaultBatchId } = useSelector(state => state.user)

  return (
    <div className={classes.storage}>
      <p className={classes.storageMessage}>
        Postages are required to upload data on the network. <br />
        They might expire in the future or run out of space,
        so keep an eye on them!
      </p>

      {(!batches || !batches.length) && (
        <Alert title="No batches found" type="danger">
          <p>
            {`You don't have any postage batch on this gateway, or
            the current gateway doesn't provide any.`}
          </p>
          <p>
            {`Without a postage batch you won't be able to upload any data.`}
          </p>
        </Alert>
      )}
      {(!batches?.length && gatewayType === "etherna-gateway") && (
        <p className={classes.storageLoading}>
          <Spinner aria-hidden /> We are creating your first storage on Etherna. Refresh this page in a few seconds.
        </p>
      )}
      {(batches && batches.length > 0) && (
        <ul className={classes.storageList}>
          {batches.map(batch => (
            <StorageBatch batch={batch} num={1} isMain={batch.id === defaultBatchId} key={batch.id} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default Storage
