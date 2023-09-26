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

import React, { useCallback, useEffect, useMemo, useState } from "react"

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid"

import ExtensionHostPanelParam from "./ExtensionHostPanelParam"
import { Alert, FormGroup } from "@/components/ui/display"

import type { ExtensionParamConfig } from "./ExtensionHostPanel"
import type { GatewayExtensionHost, IndexExtensionHost } from "@/types/extension-host"

const swarmChromeExtensionUrl =
  "https://chrome.google.com/webstore/detail/ethereum-swarm-extension/afpgelfcknfbbfnipnomfdbbnbbemnia"

type ExtensionHostFormProps<T extends IndexExtensionHost | GatewayExtensionHost> = {
  value: T | undefined | null
  params: ExtensionParamConfig[]
  onChange(extension: T): void
}

const ExtensionHostForm = <T extends IndexExtensionHost | GatewayExtensionHost>({
  value,
  params,
  onChange,
}: ExtensionHostFormProps<T>) => {
  const [swarmExtensionUrl, setSwarmExtensionUrl] = useState<string | null>()

  const paramsValues = useMemo(() => {
    return params.reduce(
      (values, param) => ({
        ...values,
        [param.key]: (value?.[param.key as keyof T] ?? param.default ?? "") as string,
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

  useEffect(() => {
    if (isBeeInstanceGatewayType && swarmExtensionUrl === undefined) {
      const exposedUrl = "http://swarm.fakeurl.localhost/bee-api"
      fetch(exposedUrl)
        .then(response => {
          if (response.status === 200) {
            setSwarmExtensionUrl(exposedUrl)
          } else {
            setSwarmExtensionUrl(null)
          }
        })
        .catch(error => {
          setSwarmExtensionUrl(null)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onParamChange = useCallback(
    (key: keyof T, val: string) => {
      const newValue = {
        ...(value ?? {}),
        [key]: val as unknown as T[keyof T],
      } as T

      onChange(newValue)
    },
    [value, onChange]
  )

  return (
    <form>
      {params
        .filter(param => !param.hidden)
        .map(param => (
          <FormGroup label={param.label} labelFor={param.key as string} key={param.key as string}>
            <ExtensionHostPanelParam
              value={paramsValues[param.key as keyof T]}
              paramConfig={param}
              onChange={val => onParamChange(param.key as keyof T, val)}
            />

            {param.key === "url" &&
              isBeeInstanceGatewayType &&
              swarmExtensionUrl &&
              paramsValues.url !== swarmExtensionUrl && (
                <span>
                  We detected the swarm extension.{" "}
                  <button
                    className="font-bold"
                    onClick={() => onParamChange(param.key as keyof T, swarmExtensionUrl)}
                  >
                    Import url from extension
                  </button>
                </span>
              )}
            {param.key === "url" &&
              paramsValues.url?.startsWith("http://") &&
              paramsValues.url !== swarmExtensionUrl &&
              isBeeInstanceGatewayType && (
                <Alert
                  color="warning"
                  icon={<ExclamationTriangleIcon width={16} aria-hidden />}
                  className="mt-3 px-2 py-1.5 text-xs font-medium"
                >
                  <span>
                    To use an insecure connection, you should install the <wbr />
                    <strong>
                      <a href={swarmChromeExtensionUrl} target="_blank" rel="noreferrer">
                        swarm extension
                      </a>
                    </strong>
                    .
                  </span>
                </Alert>
              )}
          </FormGroup>
        ))}
    </form>
  )
}

export default ExtensionHostForm
