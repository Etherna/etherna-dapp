import React from "react"
import PropTypes from "prop-types"

import MarkdownPreview from "@common/MarkdownPreview"

const ProfileAbout = ({ name, address, description }) => {
  return (
    <div>
      {/* <h3>{name || shortenEthAddr(address)}</h3> */}
      <MarkdownPreview value={description || ""} disableHeading={true} />
    </div>
  )
}

ProfileAbout.propTypes = {
  address: PropTypes.string.isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
}

export default ProfileAbout
