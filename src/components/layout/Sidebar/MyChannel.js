import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Link } from "gatsby"

import SidebarItem from "./SidebarItem"
import { getImageUrl } from "../../../utils/swarm"
import * as Routes from "../../../routes"

const MyChannel = ({ isLoggedIn, currentAddress, channelName, channelAvatar }) => {
    const hasChannel = isLoggedIn && channelName !== ""

    return (
        <div className="sidenav-menu">
            <h6 className="sidebar-label">My Channel</h6>
            {!isLoggedIn &&
                <small className="sidebar-text">Unlock your account</small>
            }
            {(isLoggedIn && !hasChannel) &&
                <Link to={Routes.getChannelEditingLink(currentAddress)}>
                    <small className="sidebar-text">Create your channel</small>
                </Link>
            }
            {hasChannel &&
                <SidebarItem
                    name={channelName}
                    imageUrl={getImageUrl(channelAvatar)}
                    link={Routes.getChannelLink(currentAddress)}
                />
            }
        </div>
    )
}

MyChannel.propTypes = {
    isLoggedIn: PropTypes.bool,
    currentAddress: PropTypes.string,
    channelName: PropTypes.string,
    channelAvatar: PropTypes.array,
}

const mapState = (state) => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        currentAddress: state.user.currentAddress,
        channelName: state.channel.channelName,
        channelAvatar: state.channel.channelAvatar,
    }
}

export default connect(mapState)(MyChannel)
