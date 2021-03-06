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

/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_NAME: string
    REACT_APP_TAGLINE: string
    REACT_APP_INFURA_ID: string
    REACT_APP_INDEX_HOST: string
    REACT_APP_INDEX_API_PATH: string
    REACT_APP_GATEWAY_HOST: string
    REACT_APP_GATEWAY_API_PATH: string
    REACT_APP_AUTH_HOST: string
    REACT_APP_AUTH_API_PATH: string
    REACT_APP_CREDIT_HOST: string
  }
}
