import useVideoEditorState from "./useVideoEditorState"
import { VideoEditorActionTypes } from "../reducer"
import { clamp } from "@utils/math"
import { deepCloneArray } from "@utils/arrays"

const useVideoEditorQueueActions = () => {
  const [state, dispatch] = useVideoEditorState()

  /**
   * Add a queue instance
   * @param name Queue name
   */
  const addToQueue = (name: string) => {
    const queue = [
      ...state.queue,
      {
        name,
        completion: null,
        reference: undefined,
      }
    ]

    dispatch({
      type: VideoEditorActionTypes.UPDATE_QUEUE,
      queue
    })
  }

  /**
   * Remove a queue
   * @param name Queue name
   */
  const removeFromQueue = (name: string) => {
    const queue = deepCloneArray(state.queue)
    const index = queue.findIndex(e => e.name === name)

    if (index >= 0) {
      queue.splice(index, 1)

      dispatch({
        type: VideoEditorActionTypes.UPDATE_QUEUE,
        queue
      })
    }
  }

  /**
   * Update queue progress/completion
   * @param name Queue name
   * @param completion Completion percentage [0-100]
   * @param finished Whether the upload has finished (default false)
   */
  const updateQueueCompletion = (name: string, completion: number, reference?: string) => {
    const clampedValue = clamp(
      completion - (completion % 10) + 5,
      0, 100
    )

    const queue = deepCloneArray(state.queue)
    const queued = queue.find(q => q.name === name)

    if (reference || (queued && queued.completion !== clampedValue)) {
      const index = queue.findIndex(e => e.name === name)

      if (index >= 0) {
        queue[index].completion = completion
        queue[index].reference = reference

        dispatch({
          type: VideoEditorActionTypes.UPDATE_QUEUE,
          queue
        })
      }
    }
  }

  /**
   * change a queue name
   * @param oldName Current Queue name
   * @param newName New Queue name
   */
  const updateQueueName = (oldName: string, newName: string) => {
    const queue = deepCloneArray(state.queue)
    const index = queue.findIndex(e => e.name === oldName)

    if (index >= 0) {
      queue[index].name = newName

      dispatch({
        type: VideoEditorActionTypes.UPDATE_QUEUE,
        queue
      })
    }
  }

  return {
    addToQueue,
    removeFromQueue,
    updateQueueName,
    updateQueueCompletion
  }
}

export default useVideoEditorQueueActions
