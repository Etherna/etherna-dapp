import React from "react"

import "./topbar-logo.scss"

import TopbarItem from "@components/navigation/TopbarItem"

type TopbarLogoProps = {
  logo: React.ReactNode
  logoCompact?: React.ReactNode
}

const TopbarLogo: React.FC<TopbarLogoProps> = ({ logo, logoCompact }) => {
  return (
    <TopbarItem to="/" ignoreHoverState>
      <figure className="topbar-logo">
        {logoCompact && (
          <div className="topbar-logo-mobile">{logoCompact}</div>
        )}
        <div className="topbar-logo-default">{logo}</div>
      </figure>
    </TopbarItem>
  )
}

export default TopbarLogo
