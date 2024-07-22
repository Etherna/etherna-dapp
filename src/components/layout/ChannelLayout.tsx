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

import AppLayoutWrapper from "./AppLayoutWrapper"
import ProfileHeader from "@/components/profile/ProfileHeader"
import { Container } from "@/components/ui/layout"

import type { EnsAddress, EthAddress } from "@etherna/sdk-js/clients"

type ChannelLayoutProps = {
  address: EthAddress | EnsAddress
  children?: React.ReactNode
}

const ChannelLayout: React.FC<ChannelLayoutProps> = ({ children, address }) => {
  return (
    <AppLayoutWrapper>
      <Container className="mx-auto">
        <ProfileHeader address={address} />
        <div className="mt-10">{children}</div>
      </Container>
    </AppLayoutWrapper>
  )
}

export default ChannelLayout
