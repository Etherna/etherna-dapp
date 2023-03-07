import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import logger from "./middlewares/log"

import type { WritableDraft } from "immer/dist/internal"

export type ExperimentsState = {}

const getInitialState = (): ExperimentsState => ({})

type SetFunc = (setFunc: (state: WritableDraft<ExperimentsState>) => void) => void
type GetFunc = () => ExperimentsState

const actions = (set: SetFunc, get: GetFunc) => ({})

const useExperimentsStore = create<ExperimentsState & ReturnType<typeof actions>>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...getInitialState(),
          ...actions(set, get),
        })),
        {
          name: "etherna:experiments",
          storage: createJSONStorage(() => localStorage),
        }
      ),
      {
        name: "experiments",
      }
    )
  )
)

export default useExperimentsStore
