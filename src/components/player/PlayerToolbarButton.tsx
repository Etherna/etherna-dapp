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
        "group relative z-1 h-7 w-7 rounded-full p-1.5 md:h-8 md:w-8 md:p-[0.425rem]",
        "bg-gray-500/50 text-gray-200 backdrop-blur"
      )}
      onClick={handleClick}
      role="button"
    >
      {icon}

      {hasMenu ? (
        <div
          className={classNames(
            "invisible absolute left-1/2 bottom-0 opacity-0",
            "z-20 -translate-x-1/2 transform pb-10",
            "hover:visible hover:opacity-100 hover:transition-opacity hover:duration-200",
            "group-hover:visible group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-200"
          )}
        >
          <div
            className={classNames(
              "flex flex-col space-y-2 rounded-full px-4 py-4",
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
