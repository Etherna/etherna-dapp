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
import { urlHostname } from "@etherna/api-js/utils"
import classNames from "classnames"

import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline"
import {
  CheckBadgeIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid"

import GatewayClient from "@/classes/GatewayClient"
import IndexClient from "@/classes/IndexClient"
import { Menu } from "@/components/ui/actions"
import { Spinner, Tooltip } from "@/components/ui/display"
import type { ExtensionType } from "@/stores/ui"
import type {
  ExtensionHost,
  GatewayExtensionHost,
  GatewayType,
  IndexExtensionHost,
} from "@/types/extension-host"

const GatewayTypeLabel: Record<GatewayType, string> = {
  "etherna-gateway": "etherna",
  bee: "bee",
}

type ExtensionHostsListProps = {
  hosts: (IndexExtensionHost | GatewayExtensionHost)[]
  selectedExtensionUrl: string
  editing?: boolean
  type: ExtensionType
  allowDelete?(host: IndexExtensionHost | GatewayExtensionHost): boolean
  onSelect?(host: ExtensionHost): void
  onDelete?(host: ExtensionHost): void
  onEdit?(host: ExtensionHost): void
}

const ExtensionHostsList: React.FC<ExtensionHostsListProps> = ({
  hosts,
  selectedExtensionUrl,
  editing,
  type,
  allowDelete,
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

      const client = type === "index" ? new IndexClient(host.url) : new GatewayClient(host.url)

      client.users
        .fetchCurrentUser({ signal: controller.signal })
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
      const client = type === "index" ? new IndexClient(host.url) : new GatewayClient(host.url)
      client.loginRedirect(window.location.href)
    },
    [type]
  )

  return (
    <div className="relative w-full">
      <div className="grid snap-y snap-mandatory auto-rows-fr grid-cols-1 gap-4 py-6 sm:grid-cols-2">
        {hosts?.map((host, i) => {
          const isActive = host.url === selectedExtensionUrl
          const isDisabled = editing && host.url !== selectedExtensionUrl
          return (
            <button
              className={classNames(
                "relative flex snap-start flex-col rounded-md px-3 py-3",
                "border-2 text-sm font-medium",
                "transition-colors duration-100",
                {
                  "border-gray-300 hover:border-gray-600": !isActive,
                  "dark:border-gray-500 dark:hover:border-gray-200": !isActive,
                  "border-primary-300 hover:border-primary-400": isActive,
                  "dark:border-primary-700 dark:hover:border-primary-600": isActive,
                  "ring-2 ring-primary-200 dark:ring-primary-600": isActive,
                  "pointer-events-none opacity-30": isDisabled,
                }
              )}
              onClick={() => onSelect?.(host)}
              key={i}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={classNames(
                    "flex items-center whitespace-nowrap font-semibold text-gray-500 dark:text-gray-400",
                    {
                      "text-gray-900 dark:text-gray-50": isActive,
                    }
                  )}
                >
                  {host.name}
                  {isVerifiedOrigin(host.url) && (
                    <Tooltip text="Verified origin">
                      <span
                        className={classNames("ml-0.5 inline-block", {
                          "text-primary-500 dark:text-primary-400": isActive,
                        })}
                      >
                        <CheckBadgeIcon width={16} aria-hidden />
                      </span>
                    </Tooltip>
                  )}
                </span>

                <Menu>
                  <Menu.Button
                    as="div"
                    className="border-none p-0"
                    aspect="text"
                    color="inverted"
                    small
                  >
                    <EllipsisHorizontalIcon className="mr-0 h-5" aria-hidden />
                  </Menu.Button>
                  <Menu.Items>
                    <Menu.Item prefix={<PencilIcon />} onClick={() => onEdit?.(host)}>
                      Edit
                    </Menu.Item>
                    {allowDelete?.(host) && (
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
                        <Menu.Item
                          prefix={<ArrowLeftOnRectangleIcon />}
                          onClick={() => signinHost(host)}
                        >
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
                  <small className="mt-1 block text-xs font-medium text-green-500">signed in</small>
                )}
                {hostsSignedIn[host.url] === false && (
                  <small className="mt-1 block text-xs font-medium text-yellow-500">
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
