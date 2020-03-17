import React, { useRef } from "react"

import { DropDown, DropDownMenu, DropDownMenuToggle } from "@common/DropDown"
import Button from "@components/common/Button"
import EnvDropDownMenus from "./EnvDropDownMenu"

const GuestMenu = () => {
    let mainMenuRef = useRef()
    let indexMenuRef = useRef()
    let gatewayMenuRef = useRef()

    return (
        <DropDown>
            <DropDownMenuToggle menuRef={mainMenuRef}>
                <Button aspect="transparent" className="btn-rounded mr-2">
                    <img src={require("@svg/icons/menu-icon.svg")} className="mx-auto" alt="" />
                </Button>
            </DropDownMenuToggle>
            <DropDownMenu menuRef={mainMenuRef} alignRight={true}>
                <DropDownMenuToggle menuRef={indexMenuRef} isMenuItem={true}>
                    <div className="flex">
                        <img src={require("@svg/icons/index-icon.svg")} alt="" />
                        <span>Index</span>
                    </div>
                </DropDownMenuToggle>
                <DropDownMenuToggle menuRef={gatewayMenuRef} isMenuItem={true}>
                    <div className="flex">
                        <img src={require("@svg/icons/gateway-icon.svg")} alt="" />
                        <span>Gateway</span>
                    </div>
                </DropDownMenuToggle>
            </DropDownMenu>
            <EnvDropDownMenus
                indexMenuRef={indexMenuRef}
                gatewayMenuRef={gatewayMenuRef}
            />
        </DropDown>
    )
}

export default GuestMenu
