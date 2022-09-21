import create from "zustand"
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

export type ExperimentsState = {}

export type ExperimentsActions = {}

const getInitialState = (): ExperimentsState => ({})

const useExperimentsStore = create<ExperimentsState & ExperimentsActions>()(
  logger(
    devtools(
      persist(
        immer(set => ({
          ...getInitialState(),
        })),
        {
          name: "etherna:experiments",
          getStorage: () => localStorage,
        }
      )
    )
  )
)

export default useExperimentsStore
