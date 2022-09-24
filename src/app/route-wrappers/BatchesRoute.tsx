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
import useBatches from "@/hooks/useBatches"

const DefaultBatchRoute: React.FC = () => {
  const { isFetchingBatches, error } = useBatches({ autofetch: true })

  return isFetchingBatches || error ? (
    <BatchLoading type="fetching" message={error} error={!!error} />
  ) : (
    <Outlet />
  )
}

export default DefaultBatchRoute
