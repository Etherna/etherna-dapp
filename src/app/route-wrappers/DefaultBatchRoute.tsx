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
import { Outlet } from "react-router-dom"

import BatchLoading from "@/components/common/BatchLoading"
import { AlertPopup } from "@/components/ui/actions"
import { Spinner } from "@/components/ui/display"
import useDefaultBatch from "@/hooks/useDefaultBatch"
import useUserStore from "@/stores/user"

const DefaultBatchRoute: React.FC = () => {
  const isFreePostageBatchConsumed = useUserStore(state => state.isFreePostageBatchConsumed)
  const {
    isFetchingBatch,
    isCreatingBatch,
    isWaitingForConfirmation,
    isUpdatingProfile,
    error,
    createDefaultBatch,
  } = useDefaultBatch({
    autofetch: true,
    saveAfterCreate: false,
  })

  const isLoading =
    isFetchingBatch || isCreatingBatch || isWaitingForConfirmation || isUpdatingProfile || error

  return (
    <div className="flex flex-1 flex-col">
      {isLoading && (
        <div className="mb-8">
          {isUpdatingProfile ? (
            <AlertPopup message="Saving changes..." show>
              <Spinner className="mx-auto mt-2" size={24} />
            </AlertPopup>
          ) : (
            !isWaitingForConfirmation && (
              <BatchLoading
                type={isCreatingBatch ? "creating" : "fetching"}
                error={!!error}
                message={
                  isFreePostageBatchConsumed
                    ? "Come back in a few minutes. If your batch isn't created create new one manually."
                    : error
                }
                onCreate={createDefaultBatch}
              />
            )
          )}
        </div>
      )}

      <Outlet />
    </div>
  )
}

export default DefaultBatchRoute
