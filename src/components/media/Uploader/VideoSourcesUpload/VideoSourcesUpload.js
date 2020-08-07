import React, { useImperativeHandle, useState, createRef } from "react"

import FileUploadFlow from "../FileUploadFlow"
import { useUploaderState } from "../UploaderContext"
import Tab, { TabContent } from "@common/Tab"
import { showError } from "@state/actions/modals"
import { deleteVideoSource } from "@utils/video"

const VideoSourcesUpload = ({ pinContent, disabled }, ref) => {
    const { state, actions } = useUploaderState()
    const { manifest } = state
    const {
        updateManifest,
        updateOriginalQuality,
        updateVideoDuration,
        addToQueue,
        removeFromQueue,
        updateCompletion,
        resetState
    } = actions
    const currentQueue = state.queue.find(q => !q.finished)
    const defaultSource = { quality: null, ref: createRef() }
    const [sources, setSources] = useState([defaultSource])

    useImperativeHandle(ref, () => ({
        clear() {
            sources.forEach(s => s.ref.current.clear())
            setSources([defaultSource])
            resetState()
        }
    }))

    const addSource = () => {
        const newSources = [...sources]
        newSources.push({
            quality: null,
            ref: createRef()
        })
        setSources(newSources)
    }

    const removeSource = async (index) => {
        try {
            const hash = await deleteVideoSource(sources[index].quality, manifest)
            updateManifest(hash)

            const newSources = [...sources]
            newSources.splice(index, 1)
            setSources(newSources)

            removeFromQueue()
        } catch (error) {
            showError("Error", error.message)
        }
    }

    const handleHashUpdate = (hash, quality) => {
        if (hash && quality) {
            updateManifest(hash)
            updateCompletion(quality, 100, true)
        }
    }

    const handleUpdateDuration = (duration, index) => {
        index === 0 && updateVideoDuration(duration)
    }

    const handleUpdateQuality = (quality, index) => {
        index === 0 && updateOriginalQuality(quality)

        const newSources = [...sources]
        newSources[index].quality = quality
        setSources(newSources)
    }

    const handleProgress = (progress, index) => {
        const quality = sources[index].quality
        updateCompletion(quality, progress)
    }

    const handleReset = quality => {
        removeFromQueue(quality)
    }

    return (
        <div>
            <label htmlFor="video">Video sources</label>
            <Tab
                defaultKey={`quality-1`}
                canAddRemoveTabs={true}
                onTabAdded={addSource}
                onTabRemoved={removeSource}
                canRemoveTab={i => i !== 0}
            >
                {sources.map((source, i) => {
                    const title = source.quality
                        ? `${i === 0 ? `Original - ` : ``}${source.quality}`
                        : `${i === 0 ? `Original` : `<add source>`}`
                    return (
                        <TabContent
                            tabKey={`quality-${i+1}`}
                            title={title}
                            key={i}
                        >
                            <FileUploadFlow
                                ref={source.ref}
                                label={title}
                                dragLabel={"Drag your video here"}
                                acceptTypes={["video", "audio"]}
                                sizeLimit={100}
                                pinContent={pinContent}
                                manifest={manifest}
                                path={`sources/${source.quality}`}
                                canProcessFile={currentQueue && currentQueue.quality === source.quality}
                                onConfirmedProcessing={() => addToQueue(source.quality)}
                                onHashUpdate={hash => handleHashUpdate(hash, source.quality)}
                                onQualityUpdate={quality => handleUpdateQuality(quality, i)}
                                onDurationUpdate={duration => handleUpdateDuration(duration, i)}
                                onProgressChange={progress => handleProgress(progress, i)}
                                onCancel={() => handleReset(source.quality)}
                                disabled={disabled}
                                key={i}
                            />
                        </TabContent>
                    )
                })}
            </Tab>
        </div>
    )
}

export default React.forwardRef(VideoSourcesUpload)