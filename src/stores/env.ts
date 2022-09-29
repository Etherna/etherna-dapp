import type Lang from "lang.js"
import create from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"
import lang from "@/lang"
import { checkIsMobile, isTouchDevice } from "@/utils/browser"

export type EnvironmentState = {
  isMobile: boolean
  isTouch: boolean
  lang: Lang
}

export type EnvironmentActions = {}

const getInitialState = (): EnvironmentState => ({
  lang,
  isMobile: checkIsMobile(),
  isTouch: isTouchDevice(),
})

const useEnvironmentStore = create<EnvironmentState & EnvironmentActions>()(
  logger(
    devtools(
      immer(set => ({
        ...getInitialState(),
      })),
      {
        name: "env",
      }
    )
  )
)

export default useEnvironmentStore
