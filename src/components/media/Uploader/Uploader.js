import React, { useState, useRef, useEffect } from "react"
import classnames from "classnames"

import "./uploader.scss"
import { UploaderContextWrapper, useUploaderState } from "./UploaderContext"
import VideoSourcesUpload from "./VideoSourcesUpload"
import FileUploadFlow from "./FileUploadFlow"
import PinContentField from "./PinContentField"
import Alert from "@common/Alert"
import Button from "@common/Button"
import Avatar from "@components/user/Avatar"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"
import { profileActions, providerActions } from "@state/actions"
import { getIdentity } from "@utils/ethernaResources/identityResources"
import { createVideo } from "@utils/ethernaResources/videosResources"
import { updatedVideoMeta } from "@utils/video"
import Routes from "@routes"

const Uploader = () => {
    const videoFlow = useRef()
    const thumbFlow = useRef()

    const { state, actions } = useUploaderState()
    const { manifest, duration, originalQuality, queue } = state
    const { updateManifest } = actions
    const hasQueuedProcesses = queue.filter(q => q.finished === false).length > 0

    const { name, avatar, existsOnIndex } = useSelector(state => state.profile)
    const { address } = useSelector(state => state.user)

    const [thumbnail, setThumbnail] = useState(undefined)
    const [pinContent, setPinContent] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [videoLink, setVideoLink] = useState(false)

    useEffect(() => {
        loadWallet()

        /**
         * Remove the wallet from store when component is unmounted.
         */
        return () => providerActions.clearWallet()
    }, [])

    const loadWallet = async () => {
        try {
            const identity = await getIdentity()

            providerActions.injectWallet("0x" + identity.etherManagedPrivateKey)
        } catch (error) {
            console.error(error)

            showError("Cannot get your identity", error.message)
        }
    }

    const submitVideo = async () => {
        setIsSubmitting(true)
        try {
            if (!existsOnIndex) {
                const created = await profileActions.createChannel(address)

                if (!created) {
                    showError(
                        "Cannot create channel",
                        `You first need to create a channel.
                        This process is automated, but didn't work this time.
                        Try again in your profile page.`
                    )
                    setIsSubmitting(false)
                    return
                }
            }

            const videoManifest = await updatedVideoMeta(manifest, {
                title,
                description,
                originalQuality,
                thumbnailHash: thumbnail,
                channelAddress: address,
                duration,
                sources: queue.map(q => q.quality)
            })

            updateManifest(videoManifest)

            //const videoFeed = await updateVideoFeed(null, videoManifest)

            await createVideo(videoManifest)
            submitCompleted(videoManifest)
        } catch (error) {
            console.error(error)
            showError("Linking error", error.message)
        }
        setIsSubmitting(false)
    }

    const submitCompleted = videoFeed => {
        setVideoLink(Routes.getVideoLink(videoFeed))
        setThumbnail(undefined)
        setTitle("")
        setDescription("")
        setHasSubmitted(true)
        clearFlows()
    }

    const clearFlows = () => {
        videoFlow.current.clear()
        thumbFlow.current.clear()
    }

    return (
        <div className="uploader">
            <div className="row">
                <h1>Upload a video</h1>
            </div>
            <div className="row mb-6">
                <div className="flex items-center">
                    <Avatar image={avatar} address={address} />
                    <h3 className="mb-0 ml-1">{name}</h3>
                </div>
            </div>
            <div className="row mb-6">
                {hasSubmitted && (
                    <Alert
                        title=""
                        type="success"
                        onClose={() => setHasSubmitted(false)}
                    >
                        Your video has been successfully uploaded and linked to
                        your profile. <br />
                        You can watch your video at this link:
                        <a href={videoLink}>
                            <strong>{videoLink}</strong>
                        </a>
                    </Alert>
                )}
            </div>
            <div className="row">
                <div className="col sm:w-1/2 lg:w-2/3">
                    <div className="form-group">
                        <VideoSourcesUpload
                            ref={videoFlow}
                            pinContent={pinContent}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <FileUploadFlow
                            ref={thumbFlow}
                            label={"Thumbnail"}
                            dragLabel={"Drag your thumbnail here"}
                            acceptTypes={["image"]}
                            sizeLimit={2}
                            pinContent={pinContent}
                            disabled={isSubmitting}
                            onHashUpdate={hash => setThumbnail(hash)}
                        />
                    </div>
                    <PinContentField onChange={pin => setPinContent(pin)} />
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            placeholder="Title of the video"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            placeholder="Description of the video"
                            value={description}
                            rows={10}
                            onChange={e => setDescription(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
                <div className="col step-col sm:w-1/2 lg:w-1/3">
                    <ul className="upload-steps mb-4">
                        <li
                            className={classnames("upload-step", {
                                "step-done": manifest,
                            })}
                        >
                            Upload a video
                        </li>
                        <li
                            className={classnames("upload-step", {
                                "step-done": title !== "",
                            })}
                        >
                            Add a title
                        </li>
                        <li
                            className={classnames("upload-step", {
                                "step-done": description !== "",
                            })}
                        >
                            Add a description (optional)
                        </li>
                        <li
                            className={classnames("upload-step", {
                                "step-done": thumbnail,
                            })}
                        >
                            Add a thumbnail (optional)
                        </li>
                    </ul>
                    {isSubmitting ? (
                        <img
                            src={require("@svg/animated/spinner.svg")}
                            width={30}
                            alt=""
                        />
                    ) : (
                        <Button
                            action={submitVideo}
                            disabled={manifest == null || title === "" || hasQueuedProcesses}
                        >
                            Add video
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

const UploaderWithContext = () => (
    <UploaderContextWrapper>
        <Uploader />
    </UploaderContextWrapper>
)

export default UploaderWithContext
