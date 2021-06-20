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

/**
 * Handle a promise withour throwing error.
 * A null value is returned instead.
 * @param promise Promise to handle
 */
export const nullablePromise = async <T>(promise: Promise<T>) =>
  new Promise<T|null>(resolve => {
    promise.then(result => resolve(result)).catch(() => resolve(null))
  })
