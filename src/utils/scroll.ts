type SmoothScrollOptions = {
  left?: number
  top?: number
  duration?: number
}

type WindowRequestAnimationFrame = typeof window & {
  mozRequestAnimationFrame?: typeof window.requestAnimationFrame
  msRequestAnimationFrame?: typeof window.requestAnimationFrame
}

let supportsSmoothScrolling = false

if (typeof window !== "undefined") {
  document.body.style.scrollBehavior = "smooth"
  supportsSmoothScrolling = getComputedStyle(document.body).scrollBehavior === "smooth"
  document.body.style.scrollBehavior = ""
}

export const smoothScroll = (el: HTMLElement, opts: SmoothScrollOptions) => {
  if (supportsSmoothScrolling) {
    return el.scrollBy({
      left: opts.left,
      top: opts.top,
      behavior: "smooth"
    })
  }

  const windowPolyfill = window as WindowRequestAnimationFrame
  const requestAnimationFrame =
    windowPolyfill.requestAnimationFrame ||
    windowPolyfill.webkitRequestAnimationFrame ||
    windowPolyfill.mozRequestAnimationFrame ||
    windowPolyfill.msRequestAnimationFrame

  let currentFrame = 1

  const frames = 60 * (opts.duration ?? 1000) / 1000
  const leftFrame = (opts.left ?? 0) / frames
  const topFrame = (opts.top ?? 0) / frames
  const leftTarget = el.scrollLeft + (opts.left ?? 0)
  const topTarget = el.scrollTop + (opts.top ?? 0)

  const elInitialLeft = el.scrollLeft
  const elInitialTop = el.scrollTop

  return new Promise<void>(res => {
    const step = () => {
      el.scrollTo({
        left: elInitialLeft + (currentFrame * leftFrame),
        top: elInitialTop + (currentFrame * topFrame),
        behavior: "smooth"
      })

      currentFrame++

      if (currentFrame <= frames) {
        requestAnimationFrame(step)
      } else {
        // fix eventual shifted position
        el.scrollTo({
          left: leftTarget,
          top: topTarget
        })

        res()
      }
    }

    requestAnimationFrame(step)
  })
}
