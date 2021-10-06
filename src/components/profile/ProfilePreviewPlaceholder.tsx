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

import classes from "@styles/components/profile/ProfilePreview.module.scss"

import Placeholder from "@common/Placeholder"

const ProfilePreviewPlaceholder = () => {
  const rows = 5
  const arrayMap = [...Array(rows).keys()]

  const videos = 3
  const videosMap = [...Array(videos).keys()]

  return (
    <>
      {arrayMap.map(i => (
        <div className={classes.profilePlaceholder} key={i}>
          <div className="flex items-center py-2">
            <Placeholder width="2rem" height="2rem" round="full" />
            <Placeholder className="ml-2" width="10rem" height="1rem" />
          </div>
          <div className="flex">
            {videosMap.map(i => (
              <div className="flex flex-col mr-2" key={i}>
                <Placeholder width="16rem" height="8rem" />
                <Placeholder width="100%" height="1rem" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default ProfilePreviewPlaceholder
