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
 */

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

  const requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame

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
