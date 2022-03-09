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

interface ImportMetaEnv {
  VITE_APP_NAME: string
  VITE_APP_TAGLINE: string
  VITE_APP_PUBLIC_URL: string
  VITE_APP_MATOMO_URL?: string
  VITE_APP_MATOMO_SITE_ID?: number
  VITE_APP_FEEDBACK_URL?: string
  VITE_APP_VERIFIED_ORIGINS: string
  VITE_APP_INDEX_URL: string
  VITE_APP_GATEWAY_URL: string
  VITE_APP_AUTH_URL: string
  VITE_APP_CREDIT_URL: string
  VITE_APP_POSTAGE_URL?: string
}
