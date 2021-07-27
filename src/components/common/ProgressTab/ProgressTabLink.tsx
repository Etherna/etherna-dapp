import React from "react"
import classNames from "classnames"

export type ProgressTabLinkProps = {
  tabKey: string
  active?: boolean
  progressList?: Array<{
    progress: number | undefined | null
    completed: boolean
  }>
  iconSvg?: React.ReactNode
  onSelect?(tabKey: string): void
}

const ProgressTabLink: React.FC<ProgressTabLinkProps> = ({
  children,
  iconSvg,
  tabKey,
  active = false,
  progressList,
  onSelect
}) => {
  return (
    <button
      className={classNames("progresstab-link", { active })}
      onClick={() => onSelect?.(tabKey)}
    >
      <span className="progresstab-link-text">
        {iconSvg && (
          <div className="progresstab-link-icon">
            {iconSvg}
          </div>
        )}
        {children}
      </span>
      {progressList && (
        <span className="progresstab-link-progress">
          {progressList.map(({ progress, completed }, i) => (
            <div
              className={classNames("progresstab-link-progress-bar", {
                active: typeof progress === "number" && !completed,
                completed,
              })}
            >
              {typeof progress === "number" && !completed && (
                <span
                  className="progresstab-link-progress-value"
                  style={{ width: `${(progress ?? 0) * 100}%` }}
                  data-progress={progress}
                />
              )}
            </div>
          ))}
        </span>
      )}
    </button>
  )
}

export default ProgressTabLink
