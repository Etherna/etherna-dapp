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
import React from "react"

import Logo from "@/components/common/Logo"
import routes from "@/routes"
import usePlayerStore from "@/stores/player"
import classNames from "@/utils/classnames"

type WatchOnProps = {
  hash: string
}

const WatchOn: React.FC<WatchOnProps> = ({ hash }) => {
  const currentTime = usePlayerStore(state => state.currentTime)
  const isPlaying = usePlayerStore(state => state.isPlaying)

  return (
    <div
      className={classNames(
        "absolute left-0 z-1 -translate-x-full",
        "transition-transform duration-200 ease-out",
        {
          "bottom-4": currentTime === 0,
          "bottom-16 md:bottom-24": currentTime > 0,
          "translate-x-0": !isPlaying,
        }
      )}
    >
      <a
        className={classNames(
          "inline-flex items-center space-x-3 p-3 sm:p-4",
          "text-sm font-medium tracking-tight",
          "bg-gray-800/60 text-white hover:text-white"
        )}
        href={import.meta.env.VITE_APP_PUBLIC_URL + routes.watch(hash)}
        target="_blank"
        rel="noreferrer"
      >
        <span>Watch on</span>
        <Logo className="h-5 grayscale" forceWhite />
      </a>
    </div>
  )
}

export default WatchOn
