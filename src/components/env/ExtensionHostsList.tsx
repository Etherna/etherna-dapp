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

import React, { useEffect, useRef, useState } from "react"
import classNames from "classnames"
import clamp from "lodash/clamp"

import classes from "@/styles/components/env/ExtensionHostsList.module.scss"
import { BadgeCheckIcon, ChevronLeftIcon } from "@heroicons/react/solid"

import { urlHostname } from "@/utils/urls"
import { smoothScroll } from "@/utils/scroll"
import type { ExtensionHost } from "@/definitions/extension-host"

type ExtensionHostsListProps = {
  hosts: ExtensionHost[]
  selectedHost: ExtensionHost | undefined
  editing?: boolean
  isVerifiedOrigin(url: string | null): boolean
  onHostSelected?(host: ExtensionHost): void
}

const ExtensionHostsList: React.FC<ExtensionHostsListProps> = ({
  hosts,
  selectedHost,
  editing,
  isVerifiedOrigin,
  onHostSelected
}) => {
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const scrollListRef = useRef<HTMLElement>()

  useEffect(() => {
    const scrollList = scrollListRef.current
    if (scrollList) {
      smoothScroll(scrollList, {
        duration: 200,
        left: scrollList.scrollWidth - scrollList.clientWidth - scrollList.scrollLeft
      })
    }
  }, [hosts])

  const initScrollList = (el: HTMLElement | null) => {
    if (!el) return

    scrollListRef.current = el

    setTimeout(() => {
      updateNavButtonsVisibility(el)
    }, 100)
  }

  const onScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const target = e.currentTarget
    updateNavButtonsVisibility(target)
  }

  const updateNavButtonsVisibility = (target: HTMLElement) => {
    if (!target) return

    setCanScrollPrev(target.scrollLeft > 0)
    setCanScrollNext(target.scrollLeft + target.clientWidth < target.scrollWidth)
  }

  const scrollList = (direction: "prev" | "next") => {
    if (!scrollListRef.current) return

    const correction = direction === "prev" ? -1 : 1

    const children = Array.from(scrollListRef.current.children) as HTMLElement[]
    const currentIndex = children.findIndex(child => child.offsetLeft >= scrollListRef.current!.scrollLeft)
    const nextIndex = clamp(currentIndex + correction, 0, children.length - 1)
    const nextScrollLeft = children[nextIndex].offsetLeft - scrollListRef.current.scrollLeft

    smoothScroll(scrollListRef.current, {
      duration: 200,
      left: nextScrollLeft
    })
  }

  return (
    <div className={classes.extensionHostsList}>
      {(canScrollPrev && !editing) && (
        <button className={classNames(classes.extensionHostsListNav, classes.prev)} onClick={() => scrollList("prev")}>
          <ChevronLeftIcon />
        </button>
      )}

      <div className={classes.extensionHostsListScrollable} onScroll={onScroll} ref={initScrollList}>
        {hosts?.map((host, i) => (
          <button
            className={classNames(classes.extensionHostsListButton, {
              [classes.active]: host.url === selectedHost?.url,
              [classes.disabled]: editing && host.url !== selectedHost?.url,
            })}
            onClick={() => onHostSelected?.(host)}
            key={i}
          >
            <span className={classes.name}>
              {host.name}
              {isVerifiedOrigin(host.url) && (
                <span className={classes.verified}>
                  <BadgeCheckIcon />
                </span>
              )}
            </span>
            <span className={classes.host}>{urlHostname(host.url)}</span>
          </button>
        ))}
      </div>

      {(canScrollNext && !editing) && (
        <button className={classNames(classes.extensionHostsListNav, classes.next)} onClick={() => scrollList("next")}>
          <ChevronLeftIcon />
        </button>
      )}
    </div>
  )
}

export default ExtensionHostsList
