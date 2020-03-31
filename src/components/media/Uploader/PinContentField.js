import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import Switch from "react-switch"
import { useSelector } from "react-redux"

import Alert from "@components/common/Alert"
import { isPinningEnabled } from "@utils/swarm"

const PinContentField = ({ onChange }) => {
    const { gatewayHost } = useSelector(state => state.env)

    const [pinningAvailable, setPinningAvailable] = useState(undefined)
    const [pinContent, setPinContent] = useState(undefined)

    useEffect(() => {
        checkPinningAvailability()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const checkPinningAvailability = async () => {
        const available = await isPinningEnabled()
        setPinningAvailable(available)
        handlePinChange(available === true)
    }

    const handlePinChange = checked => {
        setPinContent(checked)
        if (onChange) {
            onChange(checked)
        }
    }

    return (
        <div className="form-group">
            {pinningAvailable === undefined && (
                <img src={require("@svg/animated/spinner.svg")} alt="" width="20" />
            )}
            {pinningAvailable === false && (
                <Alert title="Pinning unavailable" type="warning">
                    Pinning is disabled on the current gateway <em>{gatewayHost}</em>.
                </Alert>
            )}
            {pinningAvailable === true && pinContent !== undefined && (
                <>
                    <label title="Pinning a video will make sure the node will always have a copy of the file">Pin Content</label>
                    <label className="flex items-center" htmlFor="pinContent-field">
                        <Switch
                            id="pinContent-field"
                            checkedIcon={false}
                            uncheckedIcon={false}
                            height={22}
                            width={46}
                            handleDiameter={18}
                            offColor="#ccc"
                            onColor="#34BA9C"
                            checked={pinContent}
                            onChange={handlePinChange}
                        />
                        <span className="ml-2">
                            {pinContent ? "Pinning enabled" : "Pinning disabled"}
                        </span>
                    </label>
                </>
            )}
        </div>
    )
}

PinContentField.propTypes = {
    onChange: PropTypes.func,
}

export default PinContentField