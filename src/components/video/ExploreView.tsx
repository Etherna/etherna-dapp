/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

import InfiniteScroller from "react-infinite-scroller"

import VideoGrid from "@components/video/VideoGrid"
import useSwarmVideos from "@hooks/useSwarmVideos"

const ExploreView = () => {
  const { videos, hasMore, loadMore } = useSwarmVideos()

  return (
    <InfiniteScroller
      loadMore={loadMore}
      hasMore={hasMore}
      initialLoad={false}
      threshold={30}
    >
      <VideoGrid label="New videos" videos={videos} />
    </InfiniteScroller>
  )
}

export default ExploreView
