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

import Placeholder from "@/components/common/Placeholder"

const PlayerPlaceholder = () => {
  return (
    <>
      <Placeholder width="100%" ratio={0.42} className="mt-12 mb-8" />
      <div className="flex flex-col">
        <Placeholder width="60%" height="1.5rem" round="sm" />
        <Placeholder className="mt-6" width="100%" height="5rem" round="md" />

        <div className="flex items-center mt-6">
          <Placeholder width="2.5rem" height="2.5rem" round="full" />
          <Placeholder className="ml-2" width="6rem" height="1rem" round="sm" />
        </div>
      </div>
    </>
  )
}

export default PlayerPlaceholder
