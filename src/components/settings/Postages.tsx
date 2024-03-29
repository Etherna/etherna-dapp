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

import React, { useEffect, useState } from "react"

import { InformationCircleIcon } from "@heroicons/react/24/solid"

import PostageBatchList from "./PostageBatchList"
import BatchLoading from "@/components/common/BatchLoading"
import { Alert, Spinner } from "@/components/ui/display"
import useBatches from "@/hooks/useBatches"

const Postages: React.FC = () => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const { batches, total, isFetchingBatches, isCreatingFirstBatch, error, fetchPage, updateBatch } =
    useBatches({
      limit: perPage,
    })

  useEffect(() => {
    fetchPage(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  if (error) {
    return <BatchLoading type="fetching" message={error} error />
  }

  return (
    <div className="flex max-w-screen-lg flex-col">
      <Alert
        color="info"
        className="mb-4 self-start"
        icon={<InformationCircleIcon width={18} />}
        small
      >
        <div className="flex items-start space-x-2">
          <span>
            Postages are required to upload data on the network. <br />
            They might expire in the future or run out of space, so keep an eye on them!
          </span>
        </div>
      </Alert>

      {(!batches || !batches.length) && !isFetchingBatches && (
        <Alert title="No batches found" color="error">
          <p>
            {`You don't have any postage batch on this gateway, or
            the current gateway doesn't provide any.`}
          </p>
          <p>{`Without a postage batch you won't be able to upload any data.`}</p>
        </Alert>
      )}
      {isCreatingFirstBatch && (
        <p className="mx-auto flex items-center font-medium text-gray-500 dark:text-gray-400">
          <Spinner size={20} className="mr-2" /> We are creating your first storage on Etherna.
          Refresh this page in a few seconds.
        </p>
      )}
      {batches && batches.length > 0 && (
        <div>
          <PostageBatchList
            page={page}
            perPage={perPage}
            total={total}
            batches={batches}
            isLoading={isFetchingBatches}
            onBatchUpdate={updateBatch}
            onPageChange={(page, perPage) => {
              setPage(page)
              perPage && setPerPage(perPage)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Postages
