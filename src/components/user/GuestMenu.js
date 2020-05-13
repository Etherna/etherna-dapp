import React, { useRef } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import Switch from "react-switch"

import EnvDropDownMenus from "./EnvDropDownMenu"
import {
    DropDown,
    DropDownMenu,
    DropDownMenuToggle,
    DropDownItem,
} from "@common/DropDown"
import Button from "@common/Button"
import Routes from "@routes"
import { toggleDarkMode } from "@state/actions/enviroment/darkMode"
import MenuIcon from "@icons/menu/MenuIcon"
import IndexIcon from "@icons/menu/IndexIcon"
import GatewayIcon from "@icons/menu/GatewayIcon"
import ShortcutsIcon from "@icons/menu/ShortcutsIcon"
import DarkModeIcon from "@icons/menu/DarkModeIcon"
import LightModeIcon from "@icons/menu/LightModeIcon"

const GuestMenu = () => {
    const { darkMode } = useSelector(state => state.env)
    let mainMenuRef = useRef()
    let indexMenuRef = useRef()
    let gatewayMenuRef = useRef()

    const handleDarkModeChange = () => {
        toggleDarkMode(!darkMode)
    }

    return (
        <DropDown>
            <DropDownMenuToggle menuRef={mainMenuRef}>
                <Button aspect="transparent" className="btn-rounded mr-2">
                    <MenuIcon />
                </Button>
            </DropDownMenuToggle>
            <DropDownMenu menuRef={mainMenuRef} alignRight={true}>
                <DropDownMenuToggle menuRef={indexMenuRef} isMenuItem={true}>
                    <div className="flex">
                        <IndexIcon />
                        <span>Index</span>
                    </div>
                </DropDownMenuToggle>
                <DropDownMenuToggle menuRef={gatewayMenuRef} isMenuItem={true}>
                    <div className="flex">
                        <GatewayIcon />
                        <span>Gateway</span>
                    </div>
                </DropDownMenuToggle>

                <hr />

                <DropDownItem>
                    <div className="flex w-full">
                        <DarkModeIcon />
                        <span htmlFor="darkMode-field">Dark Mode</span>
                        <Switch
                            id="darkMode-field"
                            className="ml-auto"
                            checkedIcon={<DarkModeIcon className="mx-1" color="#fff" />}
                            uncheckedIcon={<LightModeIcon className="mx-1" color="#333" />}
                            height={24}
                            width={50}
                            handleDiameter={20}
                            offColor={darkMode ? "#333" : "#ccc"}
                            onColor="#34BA9C"
                            checked={darkMode}
                            onChange={handleDarkModeChange}
                        />
                    </div>
                </DropDownItem>
                <DropDownItem>
                    <Link to={Routes.getShortcutsLink()}>
                        <ShortcutsIcon />
                        <span>Shortcuts</span>
                    </Link>
                </DropDownItem>
            </DropDownMenu>
            <EnvDropDownMenus
                indexMenuRef={indexMenuRef}
                gatewayMenuRef={gatewayMenuRef}
            />
        </DropDown>
    )
}

export default GuestMenu
