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

import { useDispatch } from "react-redux"
import { Dispatch } from "redux"

import { UIActions, UIActionTypes } from "@state/reducers/uiReducer"

export default function useExtensionEditor() {
  const dispatch = useDispatch<Dispatch<UIActions>>()

  const showEditor = (name: "index" | "gateway", url: string) => {
    dispatch({
      type: UIActionTypes.SHOW_EXTENSION_HOSTS_EDITOR,
      extensionName: name,
      extensionUrl: url
    })
  }

  const hideEditor = () => {
    dispatch({ type: UIActionTypes.HIDE_EXTENSION_HOSTS_EDITOR })
  }

  return {
    showEditor,
    hideEditor
  }
}
