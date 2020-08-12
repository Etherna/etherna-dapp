import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

import SidebarItem from "./SidebarItem"
import SidebarItemPlaceholder from "./SidebarItemPlaceholder"
import Routes from "@routes"
import useSelector from "@state/useSelector"
import { shortenEthAddr, checkIsEthAddress } from "@utils/ethFuncs"
import { getProfiles } from "@utils/swarmProfile"

const NewChannels = () => {
  const { indexClient } = useSelector(state => state.env)
  const [channels, setChannels] = useState(undefined)

  useEffect(() => {
    fetchChannels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchChannels = async () => {
    try {
      const fetchedChannels = await indexClient.users.fetchUsers(0, 5)
      setChannels(fetchedChannels || [])

      loadProfiles(fetchedChannels)
    } catch (error) {
      setChannels([])
      console.error(error)
    }
  }

  /** @param {import("@utils/indexClient").IndexUser[]} fetchedChannels */
  const loadProfiles = async fetchedChannels => {
    const profiles = await getProfiles(fetchedChannels.map(c => {
      return {
        manifest: c.identityManifest,
        address: c.address
      }
    }))
    setChannels(profiles)
  }

  return (
    <div className="sidenav-menu">
      <h6 className="sidebar-label">New Channels</h6>
      {channels === undefined && <SidebarItemPlaceholder />}
      {channels &&
        channels.map(channel => (
          <SidebarItem
            image={channel.avatar}
            fallbackAddress={channel.address}
            name={
              checkIsEthAddress(channel.name)
                ? shortenEthAddr(channel.address)
                : channel.name || shortenEthAddr(channel.address)
            }
            link={Routes.getChannelLink(channel.address)}
            key={channel.address}
          />
        ))}
    </div>
  )
}

NewChannels.propTypes = {
  profiles: PropTypes.arrayOf(
    PropTypes.shape({
      address: PropTypes.string,
      name: PropTypes.string,
    })
  ),
}

NewChannels.defaultProps = {
  profiles: [],
}

export default React.memo(NewChannels)
