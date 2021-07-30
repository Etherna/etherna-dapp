import React, { useRef, useState } from "react"
import classNames from "classnames"

import "./media-stats.scss"
import { ReactComponent as ChevronDownIcon } from "@svg/icons/chevron-down.svg"

type MediaStatsProps = {
  stats: Array<{ label: string, value: string | JSX.Element }>
  showText?: string
  hideText?: string
}

const MediaStats: React.FC<MediaStatsProps> = ({
  stats,
  showText = "Show stats",
  hideText = "Hide stats",
}) => {
  const [expanded, setExpanded] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null!)

  return (
    <div className={classNames("media-stats", { expanded })}>
      <button className="media-stats-btn" onClick={() => setExpanded(!expanded)}>
        <span className="text">
          {expanded ? hideText : showText}
        </span>
        <span className="icon">
          <ChevronDownIcon />
        </span>
      </button>

      <div
        className="media-stats-content"
        style={{ maxHeight: expanded ? `${tableRef.current.clientHeight}px` : undefined }}
      >
        <table className="media-stats-table" ref={tableRef}>
          {stats.map((stat, i) => (
            <tr key={i}>
              <th>{stat.label}</th>
              <td>{stat.value}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  )
}

export default MediaStats
