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
import React, { Fragment, useEffect, useRef, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import Tippy from "@tippyjs/react"
import classNames from "classnames"

import { ReactComponent as DiscordLogo } from "@/assets/brand/logo-discord.svg"
import { ReactComponent as BugIcon } from "@/assets/icons/bug.svg"

import useLocalStorage from "@/hooks/useLocalStorage"
import { isBotUserAgent } from "@/utils/browser"

type AlphaWarningActionProps = {
  children: React.ReactNode
  as: "button" | "a"
  href?: string
  disabled?: boolean
  alt?: boolean
  onClick?(): void
}

const AlphaWarning: React.FC = () => {
  const [hide, setHide] = useLocalStorage("setting:hide-alpha-warning", false)
  const [open, setOpen] = useState(!hide)
  const [feedbackBlocked, setFeedbackBlocked] = useState(false)
  const [toggleButton, setToggleButton] = useState<HTMLButtonElement>()
  const [dialogEl, setDialogEl] = useState<HTMLDivElement>()
  const cancelButton = useRef<HTMLButtonElement>(null)
  const initialState = useRef<boolean | null>(hide ? false : null)

  useEffect(() => {
    setTimeout(() => {
      setFeedbackBlocked(!window.ATL_JQ_PAGE_PROPS?.showCollectorDialog)
    }, 1000)
  }, [])

  useEffect(() => {
    if (open === initialState.current) return

    if (toggleButton && dialogEl) {
      dialogTransition()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, toggleButton, dialogEl])

  const dialogTransition = () => {
    const dialogBounds = dialogEl!.getBoundingClientRect()
    const targetBounds = toggleButton!.getBoundingClientRect()

    const from = open ? targetBounds : dialogBounds
    const to = open ? dialogBounds : targetBounds

    dialogEl!.parentElement!.style.zIndex = ""
    dialogEl!.style.visibility = ""
    dialogEl!.style.position = "absolute"
    dialogEl!.style.left = `${from.left}px`
    dialogEl!.style.top = `${from.top}px`
    dialogEl!.style.width = `${from.width}px`
    dialogEl!.style.height = `${from.height}px`

    const innerChild = dialogEl!.children[0] as HTMLElement
    innerChild.style.opacity = "0"

    const requestAnimationFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame

    let currentFrame = 1
    const frames = 15
    const innerFrames = frames * 0.8
    const xStep = (to.x - from.x) / frames
    const yStep = (to.y - from.y) / frames
    const widthStep = (to.width - from.width) / frames
    const heightStep = (to.height - from.height) / frames
    const innerOpacityStep = 1 / innerFrames

    const step = () => {
      dialogEl!.style.left = `${from.left + xStep * currentFrame}px`
      dialogEl!.style.top = `${from.top + yStep * currentFrame}px`
      dialogEl!.style.width = `${from.width + widthStep * currentFrame}px`
      dialogEl!.style.height = `${from.height + heightStep * currentFrame}px`

      currentFrame++

      if (currentFrame >= frames * 0.8) {
        innerChild.style.opacity = `${innerOpacityStep * (frames - innerFrames)}`
      }

      if (currentFrame <= frames) {
        requestAnimationFrame(step)
      } else {
        dialogEl!.style.visibility = !open ? "hidden" : ""
        dialogEl!.style.position = ""
        dialogEl!.style.left = ""
        dialogEl!.style.top = ""
        dialogEl!.style.width = ""
        dialogEl!.style.height = ""
        dialogEl!.parentElement!.style.zIndex = open ? "" : "-1"
        innerChild.style.opacity = open ? "1" : "0"
      }
    }

    requestAnimationFrame(step)
  }

  const handleClose = () => {
    initialState.current = null
    setOpen(false)
    setHide(true)
  }

  const handleFeedback = () => {
    window.ATL_JQ_PAGE_PROPS?.showCollectorDialog?.()
  }

  if (isBotUserAgent()) return null

  return (
    <>
      <button
        className={classNames(
          "md:absolute-center flex items-center text-sm font-semibold tracking-tight px-2.5 py-0.5 rounded-full",
          "bg-orange-400 border border-orange-500 text-orange-800"
        )}
        onClick={() => setOpen(true)}
        style={{ visibility: open || !hide ? "hidden" : undefined }}
        ref={el => el && setToggleButton(el)}
      >
        <BugIcon className="h-[1.2em]" aria-hidden />
        <span className="hidden sm:inline sm:ml-1.5">Alpha</span>
      </button>

      <Dialog
        as="div"
        className="fixed inset-0 flex p-6 z-50 isolate items-start md:items-stretch overflow-auto transition-all"
        initialFocus={cancelButton}
        open={open && !!toggleButton}
        onClose={() => setOpen(false)}
        style={{ zIndex: open ? undefined : -1, pointerEvents: open ? undefined : "none" }}
        tabIndex={0}
        static
      >
        <Transition
          as={Fragment}
          show={open}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={classNames(
              "fixed inset-0 backdrop-blur-sm transition-opacity",
              "bg-gray-500/75 dark:bg-gray-800/50"
            )}
          />
        </Transition>

        <div
          className={classNames(
            "mx-auto mt-0 md:my-auto w-full max-w-xs rounded-lg z-1 p-4",
            "bg-orange-500 shadow-lg shadow-orange-500/20 transition-[width,height,opacity]"
          )}
          ref={el => el && setDialogEl(el)}
          style={{ visibility: "hidden" }}
        >
          <div className="transition-opacity duration-200">
            <div className="flex flex-col items-center">
              <Dialog.Title className="text-xl text-center text-orange-900">
                Alpha Realease
              </Dialog.Title>
              <Dialog.Description className="leading-[1.1] text-center font-medium text-orange-800">
                The current version of this application is in alpha, meaning it might have bugs as
                well as downtime moments and data loss.
                <br />
                <br />
                We appreciate if you report any possible bug by clicking on the button below.
              </Dialog.Description>
            </div>

            <div className="flex flex-col mt-10 space-y-2">
              <AlphaWarningAction as="button" onClick={handleFeedback} disabled={feedbackBlocked}>
                <Tippy
                  content={
                    feedbackBlocked
                      ? "The feedback script has been blocked by your AdBlocker"
                      : undefined
                  }
                  disabled={!feedbackBlocked}
                >
                  <span className="flex items-center">
                    <BugIcon /> Report bug
                  </span>
                </Tippy>
              </AlphaWarningAction>
              <AlphaWarningAction as="a" href="https://discord.gg/vfHYEXf">
                <DiscordLogo /> Discord support
              </AlphaWarningAction>

              <AlphaWarningAction as="button" onClick={handleClose} alt>
                I understand
              </AlphaWarningAction>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}

const AlphaWarningAction: React.FC<AlphaWarningActionProps> = ({
  children,
  as: As,
  href,
  alt,
  disabled,
  onClick,
}) => {
  return (
    <As
      className={classNames(
        "flex items-center justify-center text-sm font-semibold px-3 py-3 rounded",
        "[&_svg]:w-[1.25em] [&_svg]:h-[1.25em] [&_svg]:mr-2",
        {
          "border border-orange-800 text-orange-800 hover:text-orange-800 active:bg-orange-700/20":
            !alt,
          "bg-orange-600 text-orange-900 active:bg-orange-700 transition-colors duration-75 mt-8":
            alt,
        }
      )}
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </As>
  )
}

export default AlphaWarning
