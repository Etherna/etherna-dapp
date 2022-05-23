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
import PropTypes from "prop-types"
import { connect, MapStateToPropsParam } from "react-redux"
import { ShortcutManager, ShortcutsKeymap } from "react-shortcuts"

import type { AppState } from "@definitions/app-state"
import type { Keymap } from "@definitions/keyboard"

type ShortcutWrapperProps = {
  children: JSX.Element
}

type ShortcutWrapperMap = {
  keymap: Keymap
}

type Props = ShortcutWrapperProps & ShortcutWrapperMap

class ShortcutWrapper extends React.PureComponent<Props> {
  shortcutManager: ShortcutManager

  static childContextTypes = {
    shortcuts: PropTypes.object.isRequired,
  }

  constructor(props: Props) {
    super(props)
    this.shortcutManager = new ShortcutManager(props.keymap as ShortcutsKeymap)
  }

  getChildContext() {
    return { shortcuts: this.shortcutManager }
  }

  render() {
    return <div>{this.props.children}</div>
  }
}

const mapState: MapStateToPropsParam<ShortcutWrapperMap, ShortcutWrapperProps, AppState> = (state: AppState) => {
  return {
    keymap: state.env.keymap,
  }
}

export default connect<ShortcutWrapperMap, {}, ShortcutWrapperProps, AppState>(mapState)(ShortcutWrapper)
