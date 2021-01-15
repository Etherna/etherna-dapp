import React from "react"
import PropTypes from "prop-types"
import { connect, MapStateToPropsParam } from "react-redux"
import { ShortcutManager, ShortcutsKeymap } from "react-shortcuts"

import { AppState } from "@state/typings"
import { Keymap } from "./typings"

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
