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

import React, { useCallback } from "react"
import classNames from "classnames"

import classes from "@/styles/components/env/ExtensionHostsList.module.scss"
import { BadgeCheckIcon, DotsCircleHorizontalIcon, PencilIcon, TrashIcon } from "@heroicons/react/solid"

import Menu from "@/components/common/Menu"
import Tooltip from "@/components/common/Tooltip"
import { urlHostname } from "@/utils/urls"
import type { ExtensionHost, GatewayExtensionHost, GatewayType, IndexExtensionHost } from "@/definitions/extension-host"

const GatewayTypeLabel: Record<GatewayType, string> = {
  "etherna-gateway": "etherna",
  bee: "bee",
}

type ExtensionHostsListProps = {
  hosts: (IndexExtensionHost | GatewayExtensionHost)[]
  selectedHost: (IndexExtensionHost | GatewayExtensionHost) | undefined
  editing?: boolean
  onSelect?(host: ExtensionHost): void
  onDelete?(host: ExtensionHost): void
  onEdit?(host: ExtensionHost): void
}

const ExtensionHostsList: React.FC<ExtensionHostsListProps> = ({
  hosts,
  selectedHost,
  editing,
  onSelect,
  onDelete,
  onEdit,
}) => {
  const isVerifiedOrigin = useCallback((url: string | null) => {
    const verifiedOrigins = import.meta.env.VITE_APP_VERIFIED_ORIGINS.split(";")
    const hostname = urlHostname(url ?? "")
    return verifiedOrigins.some(origin => origin === hostname || hostname?.endsWith("." + origin))
  }, [])

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
                  <Menu.Item prefix={<TrashIcon />} color="error" onClick={() => onDelete?.(host)}>Delete</Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
            <span className={classes.host}>
              {urlHostname(host.url)}
              {"type" in host && (
                <span> - {GatewayTypeLabel[host.type]}</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExtensionHostsList
