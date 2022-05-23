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

import classes from "@styles/components/player/PlayerToolbarButton.module.scss"

type PlayerToolbarButtonProps = {
  children?: React.ReactNode
  hasMenu?: boolean
  icon?: React.ReactElement<React.SVGAttributes<SVGElement>>
  onClick?(): void
}

const PlayerToolbarButton: React.FC<PlayerToolbarButtonProps> = ({
  children,
  icon,
  hasMenu,
  onClick
}) => {
  return (
    <div className={classes.playerToolbarButton} onClick={onClick} role="button">
      {icon}

      {hasMenu ? (
        <div className={classes.playerToolbarButtonMenu}>
          <div className={classes.playerToolbarButtonMenuList}>
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export default PlayerToolbarButton
