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

import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import SEO from "@components/layout/SEO"
import ShortcutsEditor from "@components/settings/ShortcutsEditor"

const Shortcuts = () => (
  <LayoutWrapper>
    <SEO title="Shortcuts" />

    <div className="container my-8 px-4">
      <h1>Shortcuts</h1>

      <h2>Player</h2>
      <ShortcutsEditor namespace="PLAYER" />
    </div>
  </LayoutWrapper>
)

export default Shortcuts
