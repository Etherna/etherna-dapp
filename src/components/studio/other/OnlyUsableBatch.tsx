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

import { Button } from "@/components/ui/actions"
import { Alert } from "@/components/ui/display"
import routes from "@/routes"
import useExtensionsStore from "@/stores/extensions"
import useUIStore from "@/stores/ui"
import useUserStore from "@/stores/user"

type OnlyUsableBatchProps = {
  children: React.ReactNode
}

const OnlyUsableBatch: React.FC<OnlyUsableBatchProps> = ({ children }) => {
  const gatewayType = useExtensionsStore(state => state.currentGatewayType)
  const defaultBatch = useUserStore(state => state.defaultBatchId)
  const isLoadingProfile = useUIStore(state => state.isLoadingProfile)

  const title = useMemo(() => {
    if (gatewayType === "bee") return "No postage batch found. You need to create one."
    return "No postage batch found"
  }, [gatewayType])

  if (isLoadingProfile) return null
  if (defaultBatch) return <>{children}</>

  return (
    <Alert className="my-6" color="warning" title={title}>
      You might not be able to upload yet. <br />
      Come back when your postage batch is ready.
      <span className="mt-3 block">
        <Button as="a" to={routes.studioPostages}>
          Check your postages
        </Button>
      </span>
    </Alert>
  )
}

export default OnlyUsableBatch
