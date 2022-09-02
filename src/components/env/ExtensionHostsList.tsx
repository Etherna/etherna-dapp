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

import classes from "@/styles/components/env/ExtensionHostsList.module.scss"
import { BadgeCheckIcon, DotsCircleHorizontalIcon, PencilIcon, TrashIcon } from "@heroicons/react/solid"
import { LoginIcon } from "@heroicons/react/outline"

import Menu from "@/components/common/Menu"
import Tooltip from "@/components/common/Tooltip"
import Spinner from "@/components/common/Spinner"
import { urlHostname } from "@/utils/urls"
import type { ExtensionHost, GatewayExtensionHost, GatewayType, IndexExtensionHost } from "@/definitions/extension-host"
import type { ExtensionType } from "@/definitions/app-state"
import EthernaIndexClient from "@/classes/EthernaIndexClient"
import EthernaGatewayClient from "@/classes/EthernaGatewayClient"

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

      const client = type === "index"
        ? new EthernaIndexClient({ host: host.url, abortController: controller })
        : new EthernaGatewayClient({ host: host.url, abortController: controller })

      client.users.fetchCurrentUser()
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

  const signinHost = useCallback((host: IndexExtensionHost | GatewayExtensionHost) => {
    const client = type === "index"
      ? new EthernaIndexClient({ host: host.url })
      : new EthernaGatewayClient({ host: host.url })
    client.loginRedirect(window.location.href)
  }, [type])

  return (
    <div className={classes.extensionHostsList}>
      <div className={classes.extensionHostsListGrid}>
        {hosts?.map((host, i) => (
          <button
            className={classNames(classes.extensionHostsListButton, {
              [classes.active]: host.url === selectedHost?.url,
              [classes.disabled]: editing && host.url !== selectedHost?.url,
            })}
            onClick={() => onSelect?.(host)}
            key={i}
          >
            <div className={classes.extensionHostsListButtonTop}>
              <span className={classes.name}>
                {host.name}
                {isVerifiedOrigin(host.url) && (
                  <Tooltip text="Verified origin">
                    <span className={classes.verified}>
                      <BadgeCheckIcon />
                    </span>
                  </Tooltip>
                )}
              </span>

              <Menu>
                <Menu.Button
                  as="div"
                  className={classes.extensionHostsListMenuButton}
                  aspect="link"
                  modifier="inverted"
                  small
                >
                  <DotsCircleHorizontalIcon />
                </Menu.Button>
                <Menu.Items>
                  <Menu.Item prefix={<PencilIcon />} onClick={() => onEdit?.(host)}>Edit</Menu.Item>
                  {!EthernaUrls.includes(host.url) && (
                    <Menu.Item prefix={<TrashIcon />} color="error" onClick={() => onDelete?.(host)}>Delete</Menu.Item>
                  )}
                  {isAuthHost(host) && hostsSignedIn[host.url] === false && (
                    <>
                      <Menu.Separator />
                      <Menu.Item prefix={<LoginIcon />} onClick={() => signinHost(host)}>Sign in</Menu.Item>
                    </>
                  )}
                </Menu.Items>
              </Menu>
            </div>
            <span className={classes.host}>
              <span>{urlHostname(host.url)}</span>
              {/* {"type" in host && (
                <span> - {GatewayTypeLabel[host.type]}</span>
              )} */}
              {isAuthHost(host) && hostsSignedIn[host.url] === undefined && (
                <Spinner className="mt-1" type="bouncing-line" size={24} />
              )}
              {hostsSignedIn[host.url] === true && (
                <small className={classes.extensionSignedIn}>signed in</small>
              )}
              {hostsSignedIn[host.url] === false && (
                <small className={classes.extensionSignedOut}>signed out</small>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExtensionHostsList
