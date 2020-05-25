import React from "react"
import PropTypes from "prop-types"

import "./kbd.scss"

const Kbd = ({ shortcut, className }) => {
    const isApple = /(Mac|iPhone|iPod|iPad|iPhone|iPod|iPad)/i.test(
        navigator.platform
    )
    const multiKeys = shortcut.split("+").map(k => {
        let key = k.trim().toLowerCase()
        switch (key) {
            case "enter":
                return "↩︎"
            case "cmd":
            case "command":
                return "⌘"
            case "del":
            case "delete":
                return "⌦"
            case "backspace":
                return "⌫"
            case "control":
                return "ctrl"
            case "option":
            case "alt":
                return isApple ? "⌥" : "alt"
            case "shoft":
                return "⇧"
            case "left":
                return "←"
            case "right":
                return "→"
            case "up":
                return "↑"
            case "down":
                return "↓"
            default:
                return key
        }
    })

    return (
        <span className={className}>
            {multiKeys.map((k, i) => (
                <React.Fragment key={i}>
                    <kbd>{k}</kbd>
                    {i + 1 < multiKeys.length && <span>+</span>}
                </React.Fragment>
            ))}
        </span>
    )
}

Kbd.propTypes = {
    shortcut: PropTypes.string.isRequired,
    className: PropTypes.string,
}

export default Kbd
