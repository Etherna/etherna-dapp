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

import React, { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import Tippy from "@tippyjs/react"

import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid"
import { ReactComponent as DiscordLogo } from "@/assets/brand/logo-discord.svg"
import { ReactComponent as BugIcon } from "@/assets/icons/bug.svg"

import useLocalStorage from "@/hooks/useLocalStorage"
import { isBotUserAgent } from "@/utils/browser"
import { cn } from "@/utils/classnames"

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
  const cancelButton = useRef<HTMLButtonElement>(null)
  const initialState = useRef<boolean | null>(hide ? false : null)

  useEffect(() => {
    setTimeout(() => {
      setFeedbackBlocked(!window.ATL_JQ_PAGE_PROPS?.showCollectorDialog)
    }, 1000)
  }, [])

  const handleClose = useCallback(() => {
    initialState.current = null
    setOpen(false)
    setHide(true)
  }, [setHide])

  const handleFeedback = useCallback(() => {
    window.ATL_JQ_PAGE_PROPS?.showCollectorDialog?.()
  }, [])

  if (isBotUserAgent()) return null

  return (
    <>
      <button
        className={cn(
          "flex items-center rounded-full px-2.5 py-0.5 md:absolute-center",
          "text-sm font-semibold tracking-tight",
          "border border-orange-500 bg-orange-400 text-orange-800",
          "transition"
        )}
        onClick={() => setOpen(true)}
        style={{ visibility: open || !hide ? "hidden" : undefined }}
        ref={el => el && setToggleButton(el)}
      >
        <BugIcon className="h-[1.2em]" aria-hidden />
        <span className="hidden sm:ml-1.5 sm:inline">Alpha</span>
      </button>

      <Transition.Root show={open && !!toggleButton} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-start overflow-auto p-6 transition-all md:items-stretch"
          initialFocus={cancelButton}
          onClose={() => {}}
          tabIndex={0}
          static
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Backdrop
              className={cn(
                "fixed inset-0 z-1 backdrop-blur-sm transition-opacity",
                "bg-gray-500/75 dark:bg-gray-800/50"
              )}
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-all ease-out duration-300"
            enterFrom="opacity-0 -translate-y-full scale-0"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="transition-all ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 -translate-y-full scale-0"
          >
            <Dialog.Panel
              className={cn(
                "z-1 mx-auto mt-0 w-full max-w-xs overflow-hidden rounded-lg p-4 md:my-auto",
                "bg-orange-500 shadow-lg shadow-orange-500/20"
              )}
            >
              <div className="">
                <div className="flex flex-col items-center">
                  <Dialog.Title className="text-center text-xl text-orange-900">
                    Alpha Realease
                  </Dialog.Title>
                  <Dialog.Description className="text-center font-medium leading-[1.1] text-orange-800">
                    The current version of this application is in alpha, meaning it might have bugs
                    as well as downtime moments and data loss.
                    <br />
                    <br />
                    We appreciate if you report any possible bug by clicking on the button below.
                  </Dialog.Description>
                </div>

                <div className="mt-10 flex flex-col space-y-2">
                  <AlphaWarningAction
                    as="button"
                    onClick={handleFeedback}
                    disabled={feedbackBlocked}
                  >
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
                  <AlphaWarningAction as="a" href="https://info.etherna.io/faq">
                    <ChatBubbleBottomCenterTextIcon /> FAQ
                  </AlphaWarningAction>

                  <AlphaWarningAction as="button" onClick={handleClose} alt>
                    I understand
                  </AlphaWarningAction>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
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
      className={cn(
        "flex items-center justify-center rounded px-3 py-3 text-sm font-semibold",
        "[&_svg]:mr-2 [&_svg]:h-[1.25em] [&_svg]:w-[1.25em]",
        {
          "border border-orange-800 text-orange-800 hover:text-orange-800 active:bg-orange-700/20":
            !alt,
          "mt-8 bg-orange-600 text-orange-900 transition-colors duration-75 active:bg-orange-700":
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
