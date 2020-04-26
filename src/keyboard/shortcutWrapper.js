import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { ShortcutManager } from "react-shortcuts"

class ShortcutWrapper extends React.Component {
    constructor(props) {
        super(props)

        console.log('props shortcuts', props.keymap);

        this.shortcutManager = new ShortcutManager(props.keymap)
    }

    getChildContext() {
        return { shortcuts: this.shortcutManager }
    }

    render() {
        return this.props.children
    }
}

ShortcutWrapper.childContextTypes = {
    shortcuts: PropTypes.object.isRequired
}

const mapState = state => {
    return {
        keymap: state.env.keymap
    }
}

export default connect(mapState)(ShortcutWrapper)