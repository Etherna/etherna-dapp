import React, { useRef } from "react"

import {
    DropDown,
    DropDownMenu,
    DropDownMenuToggle
} from "@common/DropDown"
import Image from "@common/Image"
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
                    <Image filename="menu-icon.svg" className="mx-auto" />
                </Button>
            </DropDownMenuToggle>
            <DropDownMenu menuRef={mainMenuRef} alignRight={true}>
                <DropDownMenuToggle menuRef={indexMenuRef} isMenuItem={true}>
                    <div className="flex">
                        <Image filename="index-icon.svg" />
                        <span>Index</span>
                    </div>
                </DropDownMenuToggle>
                <DropDownMenuToggle menuRef={gatewayMenuRef} isMenuItem={true}>
                    <div className="flex">
                        <Image filename="gateway-icon.svg" />
                        <span>Gateway</span>
                    </div>
                </DropDownMenuToggle>
            </DropDownMenu>
            <EnvDropDownMenus indexMenuRef={indexMenuRef} gatewayMenuRef={gatewayMenuRef} />
        </DropDown>
    )
}

export default GuestMenu
