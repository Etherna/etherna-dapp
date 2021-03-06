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
 */

export type IndexClientOptions = {
  host: string
  apiPath?: string
  loginPath?: string
  logoutPath?: string
}

export type IndexUser = {
  address: string
  creationDateTime: string
  identityManifest: string
}

export type IndexCurrentUser = {
  address: string
  identityManifest: string
  prevAddresses: string[]
}

export type IndexUserVideos = IndexUser & {
  videos: IndexVideo[]
}

export type IndexVideo = {
  creationDateTime: string
  encryptionKey: string
  encryptionType: IndexEncryptionType
  manifestHash: string
  ownerAddress: string
  ownerIdentityManifest: string
}

export type IndexEncryptionType = "AES256" | "Plain"
