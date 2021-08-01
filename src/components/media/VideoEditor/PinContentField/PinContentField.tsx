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

import React, { useEffect, useState } from "react"

import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"

import Alert from "@common/Alert"
import Label from "@common/Label"
import FormGroup from "@common/FormGroup"
import FieldDesrcription from "@common/FieldDesrcription"
import Toggle from "@common/Toggle"
import useSelector from "@state/useSelector"
import { urlOrigin } from "@utils/urls"

type PinContentFieldProps = {
  pinningEnabled?: boolean
  onChange?: (on: boolean) => void
}

const PinContentField = ({ pinningEnabled, onChange }: PinContentFieldProps) => {
  const { beeClient, gatewayUrl } = useSelector(state => state.env)

  const [pinningAvailable, setPinningAvailable] = useState<boolean | null | undefined>(undefined)
  const [pinContent, setPinContent] = useState(pinningEnabled)
  const [errorMessage, setErrorMessage] = useState(undefined)

  useEffect(() => {
    checkPinningAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkPinningAvailability = async () => {
    try {
      const available = await beeClient.pinEnabled()
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
    <FormGroup>
      <Label htmlFor="pinContent">Pin Content</Label>

      {pinningAvailable === undefined && (
        <Spinner width="20" />
      )}
      {pinningAvailable === false && (
        <Alert title="Pinning unavailable" type="warning">
          Pinning is disabled on the current gateway <em>{urlOrigin(gatewayUrl)}</em>.
        </Alert>
      )}
      {errorMessage && (
        <Alert title="An error has occurred" type="danger">
          {errorMessage}
        </Alert>
      )}

      {pinningAvailable === true && pinContent !== undefined && (
        <Toggle
          label={pinContent ? "Pinning enabled" : "Pinning disabled"}
          checked={pinContent}
          onChange={handlePinChange}
        />
      )}
      <FieldDesrcription>
        Pinning a video will make sure the node will always have a copy of the file.
      </FieldDesrcription>
    </FormGroup>
  )
}

export default PinContentField
