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
import classNames from "classnames"

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
  onClick,
}) => {
  const menuEl = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLDivElement
      if (menuEl.current?.contains(target) || target === menuEl.current) return

      onClick?.(e)
    },
    [onClick]
  )

  return (
    <div
      className={classNames(
        "group relative w-7 h-7 z-1 p-1.5 md:w-8 md:h-8 md:p-[0.425rem] rounded-full",
        "bg-gray-500/50 text-gray-200 backdrop-blur"
      )}
      onClick={handleClick}
      role="button"
    >
      {icon}

      {hasMenu ? (
        <div
          className={classNames(
            "invisible opacity-0 absolute left-1/2 bottom-0",
            "transform -translate-x-1/2 pb-10 z-20",
            "hover:visible hover:opacity-100 hover:transition-opacity hover:duration-200",
            "group-hover:visible group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-200"
          )}
        >
          <div
            className={classNames(
              "flex flex-col px-4 py-4 space-y-2 rounded-full",
              "bg-gray-800/75 text-gray-200 backdrop-blur"
            )}
            ref={menuEl}
          >
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
