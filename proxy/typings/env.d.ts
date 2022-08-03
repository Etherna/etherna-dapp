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

export { }

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_APP_API_VERSION: string
      ETHERNA_SSO_PROJECT_PATH: string
      ETHERNA_INDEX_PROJECT_PATH: string
      ETHERNA_CREDIT_PROJECT_PATH: string
      ETHERNA_GATEWAY_PROJECT_PATH: string
      ETHERNA_BEEHIVE_PROJECT_PATH: string
      BEE_LOCAL_INSTANCE: string
      BEE_MODE: "dev" | "testnet"
      BEE_SWAP_ENDPOINT: string
      BEE_SEED_ENABLED: string
      BEE_ENDPOINT: string
      BEE_ADMIN_PASSWORD: string
      BEE_HTTPS: string
      BEE_HTTPS_PORT: string
      SSL_KEY_FILE: string
      SSL_CRT_FILE: string
      NODE_TLS_REJECT_UNAUTHORIZED: string
      GATEWAY_PORT: string
      GATEWAY_PROXY_BEE_HOST: string
      GATEWAY_PROXY_VALIDATOR_HOST: string
      GATEWAY_PROXY_STANDALONE: string
      GATEWAY_PROXY_DISABLE_VALIDATION: string
    }
  }
}
