import React, { useEffect, useState } from "react"
import Switch from "react-switch"

import Alert from "@common/Alert"
import useSelector from "@state/useSelector"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"

type PinContentFieldProps = {
  pinningEnabled?: boolean
  onChange?: (on: boolean) => void
}

const PinContentField = ({ pinningEnabled, onChange }: PinContentFieldProps) => {
  const { bzzClient, gatewayHost } = useSelector(state => state.env)

  const [pinningAvailable, setPinningAvailable] = useState<boolean|null|undefined>(undefined)
  const [pinContent, setPinContent] = useState(pinningEnabled)
  const [errorMessage, setErrorMessage] = useState(undefined)

  useEffect(() => {
    checkPinningAvailability()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkPinningAvailability = async () => {
    try {
      const available = await bzzClient.pinEnabled()
      setPinningAvailable(available)
      pinContent === undefined && handlePinChange(available === true)
    } catch (error) {
      console.error(error)
      setPinningAvailable(null)
      setErrorMessage(error.message)
    }
  }

  const handlePinChange = (checked: boolean) => {
    setPinContent(checked)
    if (onChange) {
      onChange(checked)
    }
  }

  return (
    <div className="form-group">
      <label
        title="Pinning a video will make sure the node will always have a copy of the file"
        htmlFor="pinContent"
      >
        Pin Content
      </label>
      {pinningAvailable === undefined && (
        <Spinner width="20" />
      )}
      {pinningAvailable === false && (
        <Alert title="Pinning unavailable" type="warning">
          Pinning is disabled on the current gateway <em>{gatewayHost}</em>.
        </Alert>
      )}
      {errorMessage && (
        <Alert title="An error has occurred" type="danger">
          {errorMessage}
        </Alert>
      )}
      {pinningAvailable === true && pinContent !== undefined && (
        <>
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

export default PinContentField