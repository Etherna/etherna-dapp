import React, { useContext, createContext, useReducer, Dispatch } from "react"

const UploaderContext = createContext<UploaderContextStore|undefined>(undefined)

// Types
export type UploaderContextStore = [state: UploaderContextState, dispatch: Dispatch<AnyAction>]

export type UploaderContextState = {
  manifest?: string
  queue: { name: string, completion: number|null, finished: boolean }[]
  originalQuality?: string
  duration?: number
}

// Actions
const ActionTypes = {
  LOAD_INITIAL_STATE: "LOAD_INITIAL_STATE",
  ADD_TO_QUEUE: "ADD_TO_QUEUE",
  REMOVE_FROM_QUEUE: "REMOVE_FROM_QUEUE",
  UPDATE_QUEUE_COMPLETION: "UPDATE_QUEUE_COMPLETION",
  UPDATE_MANIFEST: "UPDATE_MANIFEST",
  UPDATE_ORIGINAL_QUALITY: "UPDATE_ORIGINAL_QUALITY",
  UPDATE_DURATION: "UPDATE_DURATION",
  RESET: "RESET",
} as const

type LoadInitialStateAction = {
  type: typeof ActionTypes.LOAD_INITIAL_STATE
  manifest: string
  duration: number
  originalQuality: string|undefined
  sources: string[]
}
type AddToQueueAction = {
  type: typeof ActionTypes.ADD_TO_QUEUE
  name: string
}
type RemoveFromQueueAction = {
  type: typeof ActionTypes.REMOVE_FROM_QUEUE
  name: string
}
type UpdateQueueCompletionAction = {
  type: typeof ActionTypes.UPDATE_QUEUE_COMPLETION
  name: string
  completion: number
  finished?: boolean
}
type UpdateManifestAction = {
  type: typeof ActionTypes.UPDATE_MANIFEST
  manifest?: string
}
type UpdateOriginalQualityAction = {
  type: typeof ActionTypes.UPDATE_ORIGINAL_QUALITY
  quality: string
}
type UpdateDurationAction = {
  type: typeof ActionTypes.UPDATE_DURATION
  duration: number
}
type ResetAction = {
  type: typeof ActionTypes.RESET
}
type AnyAction = (
  LoadInitialStateAction |
  AddToQueueAction |
  RemoveFromQueueAction |
  UpdateQueueCompletionAction |
  UpdateManifestAction |
  UpdateOriginalQualityAction |
  UpdateDurationAction |
  ResetAction
)

// Reducer
const reducer = (state: UploaderContextState, action: AnyAction): UploaderContextState => {
  switch (action.type) {
    case ActionTypes.LOAD_INITIAL_STATE: {
      const { manifest, duration, originalQuality, sources } = action
      const queue = sources.map(s => ({
        name: `sources/${s}`,
        completion: 100,
        finished: true,
      }))
      return { ...state, manifest, duration, originalQuality, queue }
    }
    case ActionTypes.UPDATE_MANIFEST:
      return { ...state, manifest: action.manifest }
    case ActionTypes.ADD_TO_QUEUE: {
      const queue = [...state.queue]
      queue.push({
        name: action.name,
        completion: null,
        finished: false,
      })
      return { ...state, queue }
    }
    case ActionTypes.REMOVE_FROM_QUEUE: {
      const queue = [...state.queue]
      const index = queue.findIndex(e => e.name === action.name)
      if (index >= 0) {
        queue.splice(index, 1)
        return { ...state, queue }
      }
      return state
    }
    case ActionTypes.UPDATE_QUEUE_COMPLETION: {
      const queue = [...state.queue]
      const index = queue.findIndex(e => e.name === action.name)
      if (index >= 0) {
        queue[index].completion = action.completion
        queue[index].finished = action.finished || false
        return { ...state, queue }
      }
      return state
    }
    case ActionTypes.UPDATE_ORIGINAL_QUALITY:
      return { ...state, originalQuality: action.quality }
    case ActionTypes.UPDATE_DURATION:
      return { ...state, duration: action.duration }
    case ActionTypes.RESET:
      return {
        manifest: undefined,
        queue: [],
        duration: undefined,
        originalQuality: undefined,
      }
    default:
      return state
  }
}

// Wrapper
type UploaderContextWrapperProps = {
  children: React.ReactNode
  manifest?: string
}
export const UploaderContextWrapper = ({ children, manifest }: UploaderContextWrapperProps) => {
  const store = useReducer(reducer, {
    manifest,
    queue: []
  })
  return (
    <UploaderContext.Provider value={store}>
      {children}
    </UploaderContext.Provider>
  )
}

// Hooks
export const useUploaderState = () => {
  const [state, dispatch] = useContext(UploaderContext)!

  const loadInitialState = (manifest: string, duration: number, originalQuality: string|undefined, sources: string[]) => {
    dispatch({
      type: ActionTypes.LOAD_INITIAL_STATE,
      manifest,
      duration,
      originalQuality,
      sources,
    })
  }
  const updateManifest = (manifest: string) => {
    dispatch({ type: ActionTypes.UPDATE_MANIFEST, manifest })
  }
  const addToQueue = (name: string) => {
    dispatch({ type: ActionTypes.ADD_TO_QUEUE, name })
  }
  const removeFromQueue = (name: string) => {
    dispatch({ type: ActionTypes.REMOVE_FROM_QUEUE, name })
  }
  /**
   * @param name Queue name
   * @param completion Completion percentage [0-100]
   * @param finished Whether the upload has finished (default false)
   */
  const updateCompletion = (name: string, completion: number, finished = false) => {
    let clampedValue = completion - (completion % 10) + 5
    clampedValue = clampedValue > 100 ? 100 : clampedValue

    const queued = state.queue.find(q => q.name === name)
    if (finished || (queued && queued.completion !== clampedValue)) {
      dispatch({
        type: ActionTypes.UPDATE_QUEUE_COMPLETION,
        name,
        completion: clampedValue,
        finished,
      })
    }
  }
  /**
   * @param {string} quality Original video quality (eg: 720p)
   */
  const updateOriginalQuality = (quality: string) => {
    dispatch({ type: ActionTypes.UPDATE_ORIGINAL_QUALITY, quality })
  }
  /**
   * @param {number} duration Video duration in seconds
   */
  const updateVideoDuration = (duration: number) => {
    dispatch({ type: ActionTypes.UPDATE_DURATION, duration })
  }
  const resetState = () => {
    dispatch({ type: ActionTypes.RESET })
  }

  const actions = {
    loadInitialState,
    updateManifest,
    addToQueue,
    removeFromQueue,
    updateCompletion,
    updateOriginalQuality,
    updateVideoDuration,
    resetState,
  }

  return { state, actions }
}
