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

import Alert from "@/components/common/Alert"
import Button from "@/components/common/Button"
import useSelector from "@/state/useSelector"
import routes from "@/routes"

type OnlyUsableBatchProps = {
  children: React.ReactNode
}

const OnlyUsableBatch: React.FC<OnlyUsableBatchProps> = ({ children }) => {
  const isStandaloneGateway = useSelector(state => state.env.isStandaloneGateway)
  const batches = useSelector(state => state.user.batches)
  const isLoadingProfile = useSelector(state => state.ui.isLoadingProfile)

  const [loading, noBatches, noUsableBatches] = useMemo(() => {
    const loading = batches == null
    const noBatches = batches && batches.length === 0
    const noUsableBatches = batches && batches.every(batch => !batch.usable)
    return [loading, noBatches, noUsableBatches]
  }, [batches])

  const title = useMemo(() => {
    if (loading) return "You storage is loading"
    if (noBatches && isStandaloneGateway) return "No storage found"
    if (noBatches) return "We are creating you first storage"
    if (noUsableBatches) return "Your storage is not usable"
    return "No storage found"
  }, [loading, noBatches, isStandaloneGateway, noUsableBatches])

  if (isLoadingProfile) return null
  if (!loading && !noBatches && !noUsableBatches) return <>{children}</>

  return (
    <Alert className="my-6" type="warning" title={title}>
      You might not be able to upload yet. <br />
      Come back when your storage is ready.

      <span className="block mt-3">
        <Button as="a" href={routes.studioStorage}>
          Check your storage
        </Button>
      </span>
    </Alert>
  )
}

export default OnlyUsableBatch
