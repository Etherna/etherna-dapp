import React, { useState } from "react"
import classnames from "classnames"
import { useSelector } from "react-redux"

import "./uploader.scss"
import Avatar from "@components/user/Avatar"
import Button from "@common/Button"
import VideoDrag from "./VideoDrag"
import VideoUpload from "./VideoUpload"

const Uploader = () => {
    const { name, avatar } = useSelector(state => state.profile)
    const { isSignedIn, address } = useSelector(state => state.user)
    const [videoFile, setVideoFile] = useState(undefined)
    const [videoHash, setVideoHash] = useState(undefined)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    if (!isSignedIn) {
        return (
            <p className="text-lg text-gray-700 text-center my-16">
                You must sign in first.
            </p>
        )
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
            <div className="row">
                <div className="col sm:w-1/2">
                    {videoFile === undefined && (
                        <VideoDrag onSelectFile={file => setVideoFile(file)} />
                    )}
                    {videoFile !== undefined && (
                        <VideoUpload
                            file={videoFile}
                            onFinishedUploading={hash => setVideoHash(hash)}
                            onRemoveVideo={() => {
                                setVideoFile(undefined)
                                setVideoHash(undefined)
                            }}
                        />
                    )}
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            placeholder="Title of the video"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
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
                        />
                    </div>
                </div>
                <div className="col step-col sm:w-1/2">
                    <ul className="upload-steps mb-4">
                        <li
                            className={classnames("upload-step", {
                                "step-done": videoHash,
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
                            Add a description
                        </li>
                    </ul>
                    <Button
                        disabled={
                            videoHash === undefined ||
                            title === "" ||
                            description === ""
                        }
                    >
                        Add video
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Uploader
