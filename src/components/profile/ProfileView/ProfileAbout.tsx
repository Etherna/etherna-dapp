import React from "react"

import MarkdownPreview from "@common/MarkdownPreview"

type ProfileAboutProps = {
  name?: string | null
  address?: string | null
  description?: string | null
}

const ProfileAbout: React.FC<ProfileAboutProps> = ({ name, address, description }) => {
  return (
    <div>
      {/* <h3>{name || shortenEthAddr(address)}</h3> */}
      <MarkdownPreview value={description || ""} disableHeading={true} />
    </div>
  )
}

export default ProfileAbout
