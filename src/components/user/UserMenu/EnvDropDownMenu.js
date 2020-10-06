import React from "react"
import PropTypes from "prop-types"

import EnvExtensionPanel from "./EnvExtensionPanel"
import { DropDownMenu } from "@common/DropDown"
import { enviromentActions } from "@state/actions"
import useSelector from "@state/useSelector"

const EnvDropDownMenus = ({ indexMenuRef, gatewayMenuRef }) => {
  const { isSignedIn, isSignedInGateway } = useSelector(state => state.user)
  const {
    indexHost,
    indexApiPath,
    gatewayHost,
    gatewayApiPath,
    indexClient,
    gatewayClient
  } = useSelector(state => state.env)

  const handleIndexUpdate = (host, apiPath) => {
    enviromentActions.updateIndexHost(host, apiPath)
    window.location.reload()
  }

  const handleIndexReset = () => {
    enviromentActions.resetIndexHost()
    window.location.reload()
  }

  const handleGatewayUpdate = (host, apiPath) => {
    enviromentActions.updateGatewayHost(host, apiPath)
    window.location.reload()
  }

  const handleGatewayReset = () => {
    enviromentActions.resetGatewayHost()
    window.location.reload()
  }

  return (
    <>
      <DropDownMenu title="Etherna Index" menuRef={indexMenuRef} alignRight={true}>
        <EnvExtensionPanel
          description={"You can change the default Etherna Index here"}
          host={indexHost}
          apiPath={indexApiPath}
          defaultHost={process.env.REACT_APP_INDEX_HOST}
          defaultApiPath={process.env.REACT_APP_INDEX_API_PATH}
          isSignedIn={isSignedIn}
          onReset={handleIndexReset}
          onSave={handleIndexUpdate}
          onSignin={() => indexClient.loginRedirect()}
          onSignout={() => indexClient.logoutRedirect()}
        />
      </DropDownMenu>

      <DropDownMenu title="Swarm Gateway" menuRef={gatewayMenuRef} alignRight={true}>
        <EnvExtensionPanel
          description={"Here you can specify a different Swarm Gateway"}
          host={gatewayHost}
          apiPath={gatewayApiPath}
          defaultHost={process.env.REACT_APP_GATEWAY_HOST}
          defaultApiPath={process.env.REACT_APP_GATEWAY_API_PATH}
          isSignedIn={isSignedInGateway}
          onReset={handleGatewayReset}
          onSave={handleGatewayUpdate}
          onSignin={() => gatewayClient.loginRedirect()}
          onSignout={() => gatewayClient.logoutRedirect()}
        />
      </DropDownMenu>
    </>
  )
}

EnvDropDownMenus.propTypes = {
  indexMenuRef: PropTypes.any.isRequired,
  gatewayMenuRef: PropTypes.any.isRequired,
}

export default EnvDropDownMenus
