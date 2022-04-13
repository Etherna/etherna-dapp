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

import profileClasses from "@styles/components/profile/ProfileInfo.module.scss"

import Placeholder from "@common/Placeholder"

const ProfileInfoPlaceholder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div className="row items-center">
        <div className="col md:max-w-xxs px-4">
          <div className={profileClasses.profileAvatar}>
            <Placeholder width="100%" height="100%" round="full" />
          </div>
        </div>
        <div className="col flex-1 px-4">
          <div className="flex space-y-2">
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col md:max-w-xxs p-4">
          <Placeholder height="1.85rem" className="w-1/2 sm:mx-auto md:w-[100%] mb-8" round="md" />
          <Placeholder width="100%" height="2.2rem" className="mt-2" round="full" />
          <Placeholder width="100%" height="2.2rem" className="mt-2" round="full" />
        </div>
        <div className="col flex-1 p-4">
          {children}
        </div>
      </div>
    </>
  )
}

export default ProfileInfoPlaceholder
