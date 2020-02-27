import React, { useEffect, useState } from "react"
import { getVideos } from "@utils/ethernaResources/videosResources"
import VideoGrid from "@components/media/VideoGrid"

const ExploreView = () => {
    const [videos, setVideos] = useState([])

    useEffect(() => {
        fetchVideos()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchVideos = async (page = 0) => {
        const fetchedVideos = await getVideos(page, 50)
        setVideos(
            page === 0 ?
                fetchedVideos :
                videos.concat(fetchVideos)
        )
    }

    return (
        <VideoGrid
            label="Reccomended videos"
            videos={videos}
        />
    )
}

export default ExploreView