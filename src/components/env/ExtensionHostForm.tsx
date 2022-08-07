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

import React, { useCallback, useMemo } from "react"

import classes from "@/styles/components/env/ExtensionHostForm.module.scss"
import { ExclamationIcon } from "@heroicons/react/solid"

import ExtensionHostPanelParam from "./ExtensionHostPanelParam"
import Alert from "@/components/common/Alert"
import Label from "@/components/common/Label"
import FormGroup from "@/components/common/FormGroup"
import type { ExtensionParamConfig } from "./ExtensionHostPanel"
import type { GatewayExtensionHost, IndexExtensionHost } from "@/definitions/extension-host"

const swarmExtensionUrl =
  "https://chrome.google.com/webstore/detail/ethereum-swarm-extension/afpgelfcknfbbfnipnomfdbbnbbemnia"

type ExtensionHostFormProps<T extends IndexExtensionHost | GatewayExtensionHost> = {
  value: T | undefined | null
  params: ExtensionParamConfig[]
  onChange(extension: T): void
}

const ExtensionHostForm = <T extends IndexExtensionHost | GatewayExtensionHost,>({
  value,
  params,
  onChange,
}: ExtensionHostFormProps<T>) => {
  const paramsValues = useMemo(() => {
    return params.reduce(
      (values, param) => ({
        ...values,
        [param.key]: (value?.[param.key as keyof T] ?? "") as string
      }),
      {} as Record<keyof T, string>
    )
  }, [value, params])

  const isGatewayExtension = useCallback(
    (paramsValues: any): paramsValues is Record<keyof GatewayExtensionHost, string> => {
      return "type" in paramsValues
    },
    []
  )

  const isBeeInstanceGatewayType = useMemo(() => {
    if (isGatewayExtension(paramsValues)) {
      return paramsValues.type === "bee"
    }
    return false
  }, [paramsValues, isGatewayExtension])

  const onParamChange = useCallback((key: keyof T, val: string) => {
    const newValue = {
      ...(value ?? {}),
      [key]: val as unknown as T[keyof T]
    } as T

    onChange(newValue)
  }, [value, onChange])

  return (
    <form>
      {params.map(param => (
        <FormGroup key={param.key as string}>
          <Label htmlFor={param.key as string}>{param.label}</Label>
          <ExtensionHostPanelParam
            value={paramsValues[param.key as keyof T]}
            paramConfig={param}
            onChange={val => onParamChange(param.key as keyof T, val)}
          />

          {param.key === "type" && paramsValues.url?.startsWith("http://") && isBeeInstanceGatewayType && (
            <Alert type="warning" className={classes.hostFormAlert}>
              <ExclamationIcon />
              <span>
                To use an insecure connection, you should install the <wbr />
                <strong>
                  <a href={swarmExtensionUrl} target="_blank" rel="noreferrer">
                    swarm extension
                  </a>
                </strong>.
              </span>
            </Alert>
          )}
        </FormGroup>
      ))}
    </form>
  )
}

export default ExtensionHostForm
