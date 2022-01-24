import React, { Fragment, useEffect, useRef, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import classNames from "classnames"

import classes from "@styles/components/navigation/AlphaWarning.module.scss"
import { ReactComponent as BugIcon } from "@assets/icons/bug.svg"
import { ReactComponent as DiscordLogo } from "@assets/brand/logo-discord.svg"

import Portal from "@common/Portal"
import useLocalStorage from "@hooks/useLocalStorage"

const AlphaWarning: React.FC = () => {
  const [hide, setHide] = useLocalStorage("setting:hide-alpha-warning", false)
  const [open, setOpen] = useState(!hide)
  const [toggleButton, setToggleButton] = useState<HTMLButtonElement>()
  const [dialogEl, setDialogEl] = useState<HTMLDivElement>()
  const cancelButton = useRef<HTMLButtonElement>(null)
  const initialState = useRef<boolean | null>(open)

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
      dialogEl!.style.left = `${from.left + (xStep * currentFrame)}px`
      dialogEl!.style.top = `${from.top + (yStep * currentFrame)}px`
      dialogEl!.style.width = `${from.width + (widthStep * currentFrame)}px`
      dialogEl!.style.height = `${from.height + (heightStep * currentFrame)}px`

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

  return (
    <>
      <button
        className={classes.alphaButton}
        onClick={() => setOpen(true)}
        style={{ visibility: open || !hide ? "hidden" : undefined }}
        ref={el => el && setToggleButton(el)}
      >
        <BugIcon /> Alpha
      </button>

      <Portal selector="#modals">
        <Dialog
          as="div"
          className={classes.alphaDialogContainer}
          initialFocus={cancelButton}
          open={open && !!toggleButton}
          onClose={() => setOpen(false)}
          style={{ zIndex: open ? undefined : -1 }}
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
            <div className={classes.alphaDialogOveraly} />
          </Transition>

          <div className={classes.alphaDialog} ref={el => el && setDialogEl(el)} style={{ visibility: "hidden" }}>
            <div className="transition-opacity duration-200">
              <div className={classes.alphaDialogBody}>
                <Dialog.Title className={classes.alphaDialogTitle}>Alpha Realease</Dialog.Title>
                <Dialog.Description className={classes.alphaDialogText}>
                  The current version of this application is in alpha,
                  meaning it might have bugs as well as downtime moments. <br />
                  We appreciate if you report any possible bug by clicking on the button below.
                </Dialog.Description>
              </div>

              <div className={classes.alphaDialogActions}>
                <button
                  className={classNames(classes.alphaDialogButton, classes.alphaDialogAction)}
                  onClick={handleFeedback}
                >
                  <BugIcon /> Report bug
                </button>
                <a
                  href="https://discord.gg/vfHYEXf"
                  target="_blank"
                  rel="noreferrer"
                  className={classNames(classes.alphaDialogButton, classes.alphaDialogAction)}
                >
                  <DiscordLogo /> Discord support
                </a>

                <button
                  className={classNames(classes.alphaDialogButton, classes.alphaDialogContinue)}
                  onClick={handleClose}
                >
                  I understand
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </Portal>
    </>
  )
}

export default AlphaWarning
