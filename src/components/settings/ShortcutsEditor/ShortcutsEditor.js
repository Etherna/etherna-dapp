import React from "react"
import PropTypes from "prop-types"

import "./shortcuts.scss"
import Button from "@common/Button"
import Kbd from "@common/Kbd"
import EditIcon from "@icons/common/EditIcon"
import ResetIcon from "@icons/common/ResetIcon"
import { splitArray } from "@utils/arrays"
import { editShortcut, resetShortcut, hasCustomShortcut } from "@state/actions/enviroment/shortcuts"
import useSelector from "@state/useSelector"

const ShortcutsEditor = ({ namespace }) => {
    const { lang, keymap } = useSelector(state => state.env)
    const { [namespace]: shortcuts } = keymap
    const shortChunks = splitArray(Object.keys(shortcuts), 10)

    return (
        <div className="shortcuts-table-container">
            {shortChunks.map((shortcutNames, i) => (
                <table className="shortcuts-table" key={i}>
                    <tbody>
                        {shortcutNames.map(shortcut => (
                            <tr key={shortcut}>
                                <td>{lang.get(`player.${shortcut}`)}</td>
                                <td>
                                    <Kbd shortcut={shortcuts[shortcut]} />
                                </td>
                                <td>
                                    <div className="flex">
                                        <Button
                                            aspect="transparent"
                                            size="small"
                                            rounded={true}
                                            action={() =>
                                                editShortcut(
                                                    namespace,
                                                    shortcut
                                                )
                                            }
                                        >
                                            <div className="m-auto">
                                                <EditIcon />
                                            </div>
                                        </Button>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex">
                                        <Button
                                            aspect="transparent"
                                            size="small"
                                            rounded={true}
                                            disabled={!hasCustomShortcut(namespace, shortcut)}
                                            action={() =>
                                                resetShortcut(
                                                    namespace,
                                                    shortcut
                                                )
                                            }
                                        >
                                            <div className="m-auto">
                                                <ResetIcon />
                                            </div>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ))}
        </div>
    )
}

ShortcutsEditor.propTypes = {
    namespace: PropTypes.string.isRequired,
}

export default ShortcutsEditor
