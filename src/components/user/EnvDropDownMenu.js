import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"

import { DropDownMenu } from "components/common/DropDown"
import Button from "components/common/Button"
import { enviromentActions } from "state/actions"

const EnvDropDownMenus = ({ indexMenuRef, gatewayMenuRef }) => {
    const { indexHost, gatewayHost } = useSelector(state => state.env)

    const [indexHostValue, setIndexHostValue] = useState(indexHost)
    const [gatewayHostValue, setGatewayHostValue] = useState(gatewayHost)

    useEffect(() => {
        setIndexHostValue(indexHost)
    }, [indexHost])

    useEffect(() => {
        setGatewayHostValue(gatewayHost)
    }, [gatewayHost])

    return (
        <>
            <DropDownMenu
                title="Etherna Index"
                menuRef={indexMenuRef}
                alignRight={true}
            >
                <li className="dropdown-content flex flex-col">
                    <p>You can change the default Etherna Index here</p>
                    <input
                        type="text"
                        value={indexHostValue}
                        onChange={e => setIndexHostValue(e.target.value)}
                    />
                    <Button
                        action={() =>
                            enviromentActions.updateIndexHost(indexHostValue)
                        }
                        size="small"
                        className="mt-2 ml-auto"
                        disabled={indexHostValue === indexHost}
                    >
                        Save
                    </Button>

                    <Button
                        action={() => enviromentActions.resetIndexHost()}
                        size="small"
                        aspect="link"
                        className="mt-2 ml-auto"
                        disabled={indexHostValue === process.env.INDEX_HOST}
                    >
                        Reset to default
                    </Button>
                </li>
            </DropDownMenu>

            <DropDownMenu
                title="Swarm Gateway"
                menuRef={gatewayMenuRef}
                alignRight={true}
            >
                <li className="dropdown-content flex flex-col">
                    <p>Here you can specify a different Swarm Gateway</p>
                    <input
                        type="text"
                        value={gatewayHostValue}
                        onChange={e => setGatewayHostValue(e.target.value)}
                    />
                    <Button
                        action={() =>
                            enviromentActions.updateGatewayHost(
                                gatewayHostValue
                            )
                        }
                        size="small"
                        className="mt-2 ml-auto"
                        disabled={gatewayHostValue === gatewayHost}
                    >
                        Save
                    </Button>

                    <Button
                        action={() => enviromentActions.resetGatewayHost()}
                        size="small"
                        aspect="link"
                        className="mt-2 ml-auto"
                        disabled={gatewayHostValue === process.env.GATEWAY_HOST}
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
