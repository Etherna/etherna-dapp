import React, { useContext, createContext, useReducer } from "react"

const UploaderContext = createContext()

const ActionTypes = {
    ADD_TO_QUEUE: "ADD_TO_QUEUE",
    REMOVE_FROM_QUEUE: "REMOVE_FROM_QUEUE",
    UPDATE_QUEUE_COMPLETION: "UPDATE_QUEUE_COMPLETION",
    UPDATE_MANIFEST: "UPDATE_MANIFEST",
    UPDATE_ORIGINAL_QUALITY: "UPDATE_ORIGINAL_QUALITY",
    UPDATE_DURATION: "UPDATE_DURATION",
    RESET: "RESET",
}

/**
 * @typedef {object} UploaderContextState
 * @property {string} manifest Current manifest
 * @property {{ quality: string, completion: number, finished: boolean }[]} queue
 * @property {string} originalQuality Original video quality
 * @property {number} duration Video duration
 */

/**
 *
 * @param {UploaderContextState} state
 * @param {{ type: string }} action
 * @returns {UploaderContextState}
 */
const reducer = (state, action) => {
    switch (action.type) {
        case ActionTypes.UPDATE_MANIFEST:
            return {...state, manifest: action.manifest}
        case ActionTypes.ADD_TO_QUEUE: {
            const queue = [...state.queue]
            queue.push({
                quality: action.quality,
                completion: null,
                finished: false
            })
            return {...state, queue}
        }
        case ActionTypes.REMOVE_FROM_QUEUE: {
            const queue = [...state.queue]
            const index = queue.findIndex(e => e.quality === action.quality)
            if (index >= 0) {
                queue.splice(index, 1)
                return {...state, queue}
            }
            return state
        }
        case ActionTypes.UPDATE_QUEUE_COMPLETION: {
            const queue = [...state.queue]
            const index = queue.findIndex(e => e.quality === action.quality)
            if (index >= 0) {
                queue[index].completion = action.completion
                queue[index].finished = action.finished || false
                return {...state, queue}
            }
            return state
        }
        case ActionTypes.UPDATE_ORIGINAL_QUALITY:
            return {...state, originalQuality: action.quality}
        case ActionTypes.UPDATE_DURATION:
            return {...state, duration: action.duration}
        case ActionTypes.RESET:
            return {
                manifest: null,
                queue: [],
                duration: null,
                originalQuality: null
            }
        default:
            return state
    }
}

export const UploaderContextWrapper = ({ children }) => {
    const store = useReducer(reducer, {
        manifest: null,
        queue: [],
        duration: null,
        originalQuality: null
    })
    return (
        <UploaderContext.Provider value={store}>
            {children}
        </UploaderContext.Provider>
    )
}

export const useUploaderState = () => {
    /** @type {[UploaderContextState]} */
    const [state, dispatch] = useContext(UploaderContext)

    /**
     * @param {string} manifest New video manifest
     */
    const updateManifest = manifest => {
        dispatch({ type: ActionTypes.UPDATE_MANIFEST, manifest })
    }

    /**
     * @param {string} quality Source quality
     */
    const addToQueue = quality => {
        dispatch({ type: ActionTypes.ADD_TO_QUEUE, quality })
    }

    /**
     * @param {string} quality Source quality
     */
    const removeFromQueue = quality => {
        dispatch({ type: ActionTypes.REMOVE_FROM_QUEUE, quality })
    }

    /**
     * @param {string} quality Source quality
     * @param {number} completion Completion percentage [0-100]
     * @param {boolean} finished Whether the upload has finished (default false)
     */
    const updateCompletion = (quality, completion, finished = false) => {
        let clampedValue = completion - completion % 10 + 5
        clampedValue = clampedValue > 100 ? 100 : clampedValue

        const queued = state.queue.find(q => q.quality === quality)
        if (finished || (queued && queued.completion !== clampedValue)) {
            dispatch({
                type: ActionTypes.UPDATE_QUEUE_COMPLETION,
                quality,
                completion: clampedValue,
                finished
            })
        }
    }

    /**
     * @param {string} quality Original video quality (eg: 720p)
     */
    const updateOriginalQuality = quality => {
        dispatch({ type: ActionTypes.UPDATE_ORIGINAL_QUALITY, quality })
    }

    /**
     * @param {number} duration Video duration in seconds
     */
    const updateVideoDuration = duration => {
        dispatch({ type: ActionTypes.UPDATE_DURATION, duration })
    }

    const resetState = () => {
        dispatch({ type: ActionTypes.RESET })
    }

    const actions = {
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
