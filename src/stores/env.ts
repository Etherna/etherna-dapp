import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import lang from "@/lang"
import { checkIsMobile, isTouchDevice } from "@/utils/browser"

import type { WritableDraft } from "immer/dist/internal"
import type Lang from "lang.js"

export type EnvironmentState = {
  isMobile: boolean
  isTouch: boolean
  lang: Lang
}

const getInitialState = (): EnvironmentState => ({
  lang,
  isMobile: checkIsMobile(),
  isTouch: isTouchDevice(),
})

type SetFunc = (setFunc: (state: WritableDraft<EnvironmentState>) => void) => void
type GetFunc = () => EnvironmentState

const actions = (set: SetFunc, get: GetFunc) => ({})

const useEnvironmentStore = create<EnvironmentState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      immer((set, get) => ({
        ...getInitialState(),
        ...actions(set, get),
      })),
      {
        name: "env",
      }
    )
  )
)

export default useEnvironmentStore
