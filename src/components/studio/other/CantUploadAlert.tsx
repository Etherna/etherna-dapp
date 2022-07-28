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

const CantUploadAlert: React.FC = () => {
  const isStandaloneGateway = useSelector(state => state.env.isStandaloneGateway)
  const defaultBatch = useSelector(state => state.user.defaultBatch)
  const isLoadingProfile = useSelector(state => state.ui.isLoadingProfile)

  const title = useMemo(() => {
    if (isStandaloneGateway) return "No postage batch found. You need to create one."
    return "No storage found"
  }, [isStandaloneGateway])

  if (isLoadingProfile) return null
  if (defaultBatch) return null

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

export default CantUploadAlert
