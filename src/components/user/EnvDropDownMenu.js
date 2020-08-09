import React, { useState, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import moment from "moment"

import { DropDownMenu } from "@common/DropDown"
import Button from "@common/Button"
import { enviromentActions } from "@state/actions"
import useSelector from "@state/useSelector"
import http from "@utils/request"

const EnvDropDownMenus = ({ indexMenuRef, gatewayMenuRef }) => {
  const indexLastChangeRef = useRef({})
  const { indexHost, indexApiVersion, gatewayHost } = useSelector(state => state.env)

  const [indexHostValue, setIndexHostValue] = useState(indexHost)
  const [indexApiVersionValue, setIndexApiVersionValue] = useState(indexApiVersion)
  const [gatewayHostValue, setGatewayHostValue] = useState(gatewayHost)

  useEffect(() => {
    setIndexHostValue(indexHost)
  }, [indexHost])

  useEffect(() => {
    setGatewayHostValue(gatewayHost)
  }, [gatewayHost])

  const handleIndexChange = e => {
    const host = e.target.value
    setIndexHostValue(host)

    if ("lastChange" in indexLastChangeRef.current) {
      indexLastChangeRef.current.host = host
      indexLastChangeRef.current.lastChange = moment()
    } else {
      indexLastChangeRef.current.lastChange = moment()
      indexLastChangeRef.current.host = host
      updateIndexVersion()
    }
  }

  const updateIndexVersion = () => {
    const update = async () => {
      const { lastChange, host } = indexLastChangeRef.current
      if (moment.duration(moment().diff(lastChange)).seconds() < 0.75) {
        setTimeout(() => {
          update()
        }, 250)
      } else {
        try {
          const resp = await http.get(`${host}/swagger/v0.2/swagger.json`)
          const info = resp.data && resp.data.info
          const apiVersion = info && info.version

          setIndexApiVersionValue(apiVersion || "")
          indexLastChangeRef.current = {}
        } catch (error) {
          setIndexApiVersionValue("")
          indexLastChangeRef.current = {}
        }
      }
    }
    update()
  }

  const handleIndexUpdate = () => {
    enviromentActions.updateIndexHost(indexHostValue, indexApiVersionValue)
    window.location.reload()
  }

  const handleIndexReset = () => {
    enviromentActions.resetIndexHost()
    window.location.reload()
  }

  const handleGatewayUpdate = () => {
    enviromentActions.updateGatewayHost(gatewayHostValue)
    window.location.reload()
  }

  const handleGatewayReset = () => {
    enviromentActions.resetGatewayHost()
    window.location.reload()
  }

  return (
    <>
      <DropDownMenu title="Etherna Index" menuRef={indexMenuRef} alignRight={true}>
        <li className="dropdown-content flex flex-col">
          <p>You can change the default Etherna Index here</p>

          <div className="flex mt-3">
            <strong className="flex-1">Host</strong>
            <strong className="w-auto text-right">Version</strong>
          </div>
          <div className="flex">
            <div className="flex-1">
              <input type="text" value={indexHostValue} onChange={handleIndexChange} />
            </div>
            <div className="w-16">
              <input
                type="text"
                value={indexApiVersionValue}
                onChange={e => setIndexApiVersionValue(e.target.value)}
              />
            </div>
          </div>
          <Button
            action={handleIndexUpdate}
            size="small"
            className="mt-2 ml-auto"
            disabled={indexHostValue === indexHost && indexApiVersionValue === indexApiVersion}
          >
            Save
          </Button>

          <Button
            action={handleIndexReset}
            size="small"
            aspect="link"
            className="mt-2 ml-auto"
            disabled={
              indexHostValue === process.env.REACT_APP_INDEX_HOST &&
              indexApiVersionValue === process.env.REACT_APP_INDEX_API_VERSION
            }
          >
            Reset to default
          </Button>
        </li>
      </DropDownMenu>

      <DropDownMenu title="Swarm Gateway" menuRef={gatewayMenuRef} alignRight={true}>
        <li className="dropdown-content flex flex-col">
          <p>Here you can specify a different Swarm Gateway</p>
          <input
            type="text"
            value={gatewayHostValue}
            onChange={e => setGatewayHostValue(e.target.value)}
          />
          <Button
            action={handleGatewayUpdate}
            size="small"
            className="mt-2 ml-auto"
            disabled={gatewayHostValue === gatewayHost}
          >
            Save
          </Button>

          <Button
            action={handleGatewayReset}
            size="small"
            aspect="link"
            className="mt-2 ml-auto"
            disabled={gatewayHostValue === process.env.REACT_APP_GATEWAY_HOST}
          >
            Reset to default
          </Button>
        </li>
      </DropDownMenu>
    </>
  )
}

EnvDropDownMenus.propTypes = {
  indexMenuRef: PropTypes.any.isRequired,
  gatewayMenuRef: PropTypes.any.isRequired,
}

export default EnvDropDownMenus
