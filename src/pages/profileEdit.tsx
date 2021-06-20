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
import { useParams } from "react-router-dom"

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ProfileEditor from "@components/profile/ProfileEditor"
import useSelector from "@state/useSelector"

const ProfileEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const { name } = useSelector(state => state.profile)

  return (
    <LayoutWrapper>
      <SEO title={`Editing profile ${name || id}`} />
      <ProfileEditor address={id} />
    </LayoutWrapper>
  )
}

export default ProfileEditPage
