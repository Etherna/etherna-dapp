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

import classes from "@/styles/components/player/PlayerWatchOn.module.scss"

import Logo from "@/components/common/Logo"
import routes from "@/routes"

type PlayerWatchOnProps = {
  hash: string
}

const PlayerWatchOn: React.FC<PlayerWatchOnProps> = ({ hash }) => {
  return (
    <a
      className={classes.playerWatchOn}
      href={import.meta.env.VITE_APP_PUBLIC_URL + routes.watch(hash)}
      target="_blank"
      rel="noreferrer"
    >
      <span>Watch on</span>
      <Logo white />
    </a>
  )
}

export default PlayerWatchOn
