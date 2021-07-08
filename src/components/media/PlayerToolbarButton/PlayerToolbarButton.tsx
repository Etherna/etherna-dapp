import React from "react"

import "./player-toolbar-button.scss"

type PlayerToolbarButtonProps = {
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
    <div className="player-toolbar-button" onClick={onClick} role="button">
      {icon}

      {hasMenu ? (
        <div className="player-toolbar-button-menu">
          <div className="player-toolbar-button-menu-list">
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
