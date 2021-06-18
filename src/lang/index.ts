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

import Lang from "lang.js"

import PlayerEn from "./shortcuts/player.en"

// Define all paths to translations
const paths = [
  {
    messages: PlayerEn,
    namespace: "en.player",
  },
]

// Merge all into 1 object
const mergedMessages = paths.map(lang => {
  let keys = {
    [lang.namespace]: lang.messages,
  }
  return keys
})

// Export Lang instance
const lang = new Lang({
  locale: "en",
  messages: Object.assign({}, ...mergedMessages),
})

export default lang
