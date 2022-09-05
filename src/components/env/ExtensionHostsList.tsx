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
import React, { useCallback, useEffect, useState } from "react"
import classNames from "classnames"

import { LoginIcon } from "@heroicons/react/outline"
import {
  BadgeCheckIcon,
  DotsCircleHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/solid"

import EthernaGatewayClient from "@/classes/EthernaGatewayClient"
import EthernaIndexClient from "@/classes/EthernaIndexClient"
import { Menu } from "@/components/ui/actions"
import { Spinner, Tooltip } from "@/components/ui/display"
import type { ExtensionType } from "@/definitions/app-state"
import type {
  ExtensionHost,
  GatewayExtensionHost,
  GatewayType,
  IndexExtensionHost,
} from "@/definitions/extension-host"
import { urlHostname } from "@/utils/urls"

const GatewayTypeLabel: Record<GatewayType, string> = {
  "etherna-gateway": "etherna",
  bee: "bee",
}

const EthernaUrls = [
  import.meta.env.VITE_APP_GATEWAY_URL,
  import.meta.env.VITE_APP_INDEX_URL,
  import.meta.env.VITE_APP_CREDIT_URL,
]

type ExtensionHostsListProps = {
  hosts: (IndexExtensionHost | GatewayExtensionHost)[]
  selectedHost: (IndexExtensionHost | GatewayExtensionHost) | undefined
  editing?: boolean
  type: ExtensionType
  onSelect?(host: ExtensionHost): void
  onDelete?(host: ExtensionHost): void
  onEdit?(host: ExtensionHost): void
}

const ExtensionHostsList: React.FC<ExtensionHostsListProps> = ({
  hosts,
  selectedHost,
  editing,
  type,
  onSelect,
  onDelete,
  onEdit,
}) => {
  const [hostsSignedIn, sethostsSignedIn] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const controllers: AbortController[] = []

    sethostsSignedIn({})

    hosts.forEach(host => {
      if ("type" in host && host.type === "bee") {
        return
      }

      const controller = new AbortController()
      controllers.push(controller)

      const client =
        type === "index"
          ? new EthernaIndexClient({ host: host.url, abortController: controller })
          : new EthernaGatewayClient({ host: host.url, abortController: controller })

      client.users
        .fetchCurrentUser()
        .then(() => {
          sethostsSignedIn(hostsSignedIn => ({
            ...hostsSignedIn,
            [host.url]: true,
          }))
        })
        .catch(() => {
          sethostsSignedIn(hostsSignedIn => ({
            ...hostsSignedIn,
            [host.url]: false,
          }))
        })
    })

    return () => {
      controllers.forEach(controller => controller.abort())
    }
  }, [hosts, type])

  const isVerifiedOrigin = useCallback((url: string | null) => {
    const verifiedOrigins = import.meta.env.VITE_APP_VERIFIED_ORIGINS.split(";")
    const hostname = urlHostname(url ?? "")
    return verifiedOrigins.some(origin => origin === hostname || hostname?.endsWith("." + origin))
  }, [])

  const isAuthHost = useCallback((host: IndexExtensionHost | GatewayExtensionHost) => {
    if ("type" in host) {
      return host.type === "etherna-gateway"
    }
    return true
  }, [])

  const signinHost = useCallback(
    (host: IndexExtensionHost | GatewayExtensionHost) => {
      const client =
        type === "index"
          ? new EthernaIndexClient({ host: host.url })
          : new EthernaGatewayClient({ host: host.url })
      client.loginRedirect(window.location.href)
    },
    [type]
  )

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-2 auto-rows-fr gap-4 py-6 snap-y snap-mandatory">
        {hosts?.map((host, i) => {
          const isActive = host.url === selectedHost?.url
          const isDisabled = editing && host.url !== selectedHost?.url
          return (
            <button
              className={classNames(
                "snap-start relative flex flex-col  rounded-md px-3 py-3",
                "text-sm font-medium border-2 border-gray-300 dark:border-gray-500",
                "transition-colors duration-100 hover:border-gray-300 dark:hover:border-gray-200",
                {
                  "border-primary-500 hover:border-primary-500 ring-2 ring-primary-200 dark:ring-primary-700":
                    isActive,
                  "opacity-30 pointer-events-none": isDisabled,
                }
              )}
              onClick={() => onSelect?.(host)}
              key={i}
            >
              <div className="w-full flex items-center justify-between">
                <span
                  className={classNames(
                    "text-gray-500 dark:text-gray-400 font-semibold flex items-center whitespace-nowrap",
                    {
                      "text-gray-900 dark:text-gray-50": isActive,
                    }
                  )}
                >
                  {host.name}
                  {isVerifiedOrigin(host.url) && (
                    <Tooltip text="Verified origin">
                      <span
                        className={classNames("inline-block ml-0.5", {
                          "text-primary-500 dark:text-primary-400": isActive,
                        })}
                      >
                        <BadgeCheckIcon width={16} aria-hidden />
                      </span>
                    </Tooltip>
                  )}
                </span>

                <Menu>
                  <Menu.Button
                    as="div"
                    className="p-0 border-none"
                    aspect="text"
                    color="inverted"
                    small
                  >
                    <DotsCircleHorizontalIcon className="h-5 mr-0" aria-hidden />
                  </Menu.Button>
                  <Menu.Items>
                    <Menu.Item prefix={<PencilIcon />} onClick={() => onEdit?.(host)}>
                      Edit
                    </Menu.Item>
                    {!EthernaUrls.includes(host.url) && (
                      <Menu.Item
                        prefix={<TrashIcon />}
                        color="error"
                        onClick={() => onDelete?.(host)}
                      >
                        Delete
                      </Menu.Item>
                    )}
                    {isAuthHost(host) && hostsSignedIn[host.url] === false && (
                      <>
                        <Menu.Separator />
                        <Menu.Item prefix={<LoginIcon />} onClick={() => signinHost(host)}>
                          Sign in
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Items>
                </Menu>
              </div>
              <span
                className={classNames(
                  "flex flex-col items-start text-xs text-gray-400 dark:text-gray-50",
                  {
                    "text-gray-900 dark:text-gray-50": isActive,
                  }
                )}
              >
                <span>{urlHostname(host.url)}</span>
                {/* {"type" in host && (
                  <span> - {GatewayTypeLabel[host.type]}</span>
                )} */}
                {isAuthHost(host) && hostsSignedIn[host.url] === undefined && (
                  <Spinner className="mt-1" type="bouncing-line" size={24} />
                )}
                {hostsSignedIn[host.url] === true && (
                  <small className="block mt-1 text-xs font-medium text-green-500">signed in</small>
                )}
                {hostsSignedIn[host.url] === false && (
                  <small className="block mt-1 text-xs font-medium text-yellow-500">
                    signed out
                  </small>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ExtensionHostsList
