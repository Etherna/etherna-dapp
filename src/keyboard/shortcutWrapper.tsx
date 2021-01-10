import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { ShortcutManager } from "react-shortcuts"

import { AppState } from "@state/typings"

class ShortcutWrapper extends React.Component {
  shortcutManager: ShortcutManager

  static childContextTypes = {
    shortcuts: PropTypes.object.isRequired,
  }

  constructor(props: any) {
    super(props)
    this.shortcutManager = new ShortcutManager(props.keymap)
  }

  getChildContext() {
    return { shortcuts: this.shortcutManager }
  }

  render() {
    return this.props.children
  }
}

const mapState = (state: AppState) => {
  return {
    keymap: state.env.keymap,
  }
}

export default connect(mapState)(ShortcutWrapper)
