import React from "react"

import Placeholder from "@common/Placeholder"

const VideoPreviewPlaceholder = () => {
    const rows = 10
    const arrayMap = [...Array(rows).keys()]

    return (
        <>
            {
                arrayMap.map(i => (
                    <div className="flex flex-col" key={i}>
                        <Placeholder
                            className="pt-40"
                            width="100%"
                            height="100%"
                        />
                        <div className="flex items-top mt-2">
                            <Placeholder
                                width="2rem"
                                height="2rem"
                                round="full"
                            />
                            <div className="flex flex-col flex-1 ml-2">
                                <Placeholder
                                    width="100%"
                                    height="1rem"
                                />
                                <Placeholder
                                    className="mt-1"
                                    width="60%"
                                    height="0.75rem"
                                />
                            </div>
                        </div>
                    </div>
                ))
            }
        </>
    )
}

export default VideoPreviewPlaceholder