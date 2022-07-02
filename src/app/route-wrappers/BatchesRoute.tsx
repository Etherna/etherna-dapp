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

import { ReactComponent as Spinner } from "@/assets/animated/spinner.svg"

import useBatches from "@/state/hooks/user/useBatches"

const BatchesRoute: React.FC = () => {
  const { isFetchingBatches } = useBatches({ autofetch: true })

  return (
    isFetchingBatches ? (
      <div className="w-full flex items-center justify-center p-8">
        <Spinner width={24} height={24} />
      </div>
    ) : (
      <Outlet />
    )
  )
}

export default BatchesRoute
