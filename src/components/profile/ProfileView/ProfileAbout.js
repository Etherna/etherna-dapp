import React from "react"
import PropTypes from "prop-types"

const ProfileAbout = ({ name, address, description }) => {
  return (
    <div>
      {/* <h3>{name || shortenEthAddr(address)}</h3> */}
      <p>{description || ""}</p>
    </div>
  )
}

ProfileAbout.propTypes = {
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  description: PropTypes.string,
}

export default ProfileAbout
