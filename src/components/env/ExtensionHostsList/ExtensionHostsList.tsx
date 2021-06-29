import React, { useRef, useState } from "react"
import classNames from "classnames"
import clamp from "lodash/clamp"

import "./extension-hosts-list.scss"
import { ReactComponent as VerifiedIcon } from "@svg/icons/badge-check.svg"
import { ReactComponent as ChevronLeftIcon } from "@svg/icons/chevron-left.svg"

import { ExtensionHost } from "@components/env/ExtensionHostPanel/types"
import { urlHostname } from "@utils/urls"
import { smoothScroll } from "@utils/scroll"

type ExtensionHostsListProps = {
  hosts: ExtensionHost[]
  selectedHost: ExtensionHost | undefined
  isVerifiedOrigin(url: string | null): boolean
  onHostSelected?(host: ExtensionHost): void
}

const ExtensionHostsList: React.FC<ExtensionHostsListProps> = ({ hosts, selectedHost, isVerifiedOrigin, onHostSelected }) => {
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const scrollListRef = useRef<HTMLElement>()

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
    <div className="extension-hosts-list">
      {canScrollPrev && (
        <button className="extension-hosts-list-nav prev" onClick={() => scrollList("prev")}>
          <ChevronLeftIcon />
        </button>
      )}

      <div className="extension-hosts-list-scrollable" onScroll={onScroll} ref={initScrollList}>
        {hosts?.map((host, i) => (
          <button
            className={classNames("extension-hosts-list-button", { active: host.url === selectedHost?.url })}
            onClick={() => onHostSelected?.(host)}
            key={i}
          >
            <span className="name">
              {host.name}
              {isVerifiedOrigin(host.url) && (
                <span className="verified">
                  <VerifiedIcon />
                </span>
              )}
            </span>
            <span className="host">{urlHostname(host.url)}</span>
          </button>
        ))}
      </div>

      {canScrollNext && (
        <button className="extension-hosts-list-nav next" onClick={() => scrollList("next")}>
          <ChevronLeftIcon />
        </button>
      )}
    </div>
  )
}

export default ExtensionHostsList
