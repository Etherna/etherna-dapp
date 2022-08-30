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

import React, { useCallback, useRef } from "react"

import classes from "@/styles/components/player/PlayerToolbarButton.module.scss"

type PlayerToolbarButtonProps = {
  children?: React.ReactNode
  hasMenu?: boolean
  icon?: React.ReactElement<React.SVGAttributes<SVGElement>>
  onClick?(e: React.MouseEvent): void
}

const PlayerToolbarButton: React.FC<PlayerToolbarButtonProps> = ({
  children,
  icon,
  hasMenu,
  onClick
}) => {
  const menuEl = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLDivElement
    if (menuEl.current?.contains(target) || target === menuEl.current) return

    onClick?.(e)
  }, [onClick])

  return (
    <div className={classes.playerToolbarButton} onClick={handleClick} role="button">
      {icon}

      {hasMenu ? (
        <div className={classes.playerToolbarButtonMenu}>
          <div className={classes.playerToolbarButtonMenuList} ref={menuEl}>
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
