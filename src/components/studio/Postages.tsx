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

import classes from "@/styles/components/studio/Postages.module.scss"
import { ReactComponent as Spinner } from "@/assets/animated/spinner.svg"
import { InformationCircleIcon } from "@heroicons/react/solid"

import PostageBatchList from "./postages/PostageBatchList"
import Alert from "@/components/common/Alert"
import useSelector from "@/state/useSelector"
import useBatches from "@/state/hooks/user/useBatches"

const Postages: React.FC = () => {
  const gatewayType = useSelector(state => state.env.gatewayType)
  const batches = useSelector(state => state.user.batches)
  const { updateBatch } = useBatches()

  return (
    <div className={classes.storage}>
      <Alert type="info" className={classes.storageMessage} small>
        <div className="flex items-start space-x-2">
          <InformationCircleIcon width={18} />
          <span>
            Postages are required to upload data on the network. <br />
            They might expire in the future or run out of space,
            so keep an eye on them!
          </span>
        </div>
      </Alert>

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
        <PostageBatchList batches={batches} onBatchUpdate={updateBatch} />
      )}
    </div>
  )
}

export default Postages