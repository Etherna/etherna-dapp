import React, { useContext, useMemo, useState } from "react"
import { Menu as HLMenu } from "@headlessui/react"
import { usePopper } from "react-popper"
import classNames from "classnames"
import type { Placement } from "@popperjs/core"

import classes from "@/styles/components/common/Menu.module.scss"

import LibButton from "./Button"
import Breakpoint from "./Breakpoint"
import Drawer from "./Drawer"
import type { ButtonProps } from "./Button"

type MenuProps = {
  children: React.ReactNode
  className?: string
}

type MenuItemsProps = {
  children: React.ReactNode
  className?: string
  width?: string | number
  height?: string | number
  placement?: Placement
}

type MenuItemProps = {
  children: React.ReactNode
  className?: string
  href?: string
  rel?: string
  target?: "_blank"
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "alert"
  disabled?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onClick?(): void
}

const Button: React.FC<ButtonProps> = (props) => {
  const { setButtonEl } = useContext(MenuContext)!

  return (
    <HLMenu.Button
      as="div"
      className="inline-flex"
      ref={(el: HTMLDivElement) => {
        el && setButtonEl(el)
      }}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <LibButton {...props}>
        {props.children}
      </LibButton>
    </HLMenu.Button>
  )
}

const Items: React.FC<MenuItemsProps> = ({
  children,
  width,
  height,
  placement = "bottom",
}) => {
  const { buttonEl, panelEl, setPanelEl } = useContext(MenuContext)!
  const [arrowEl, setArrowEl] = useState<HTMLSpanElement>()
  const { styles, attributes, state } = usePopper(buttonEl, panelEl, {
    modifiers: [{
      name: "arrow",
      options: {
        element: arrowEl,
      },
    }, {
      name: "offset",
      options: {
        offset: [0, 12],
      },
    }, {
      name: "computeStyles",
      options: {
        adaptive: false,
      },
    }],
    placement,
  })
  const arrowRotation = useMemo(() => {
    const rotation = state?.placement?.startsWith("top") ? 180 :
      state?.placement?.startsWith("right") ? -90 :
        state?.placement?.startsWith("left") ? 90 :
          0
    return rotation
  }, [state?.placement])

  return (
    <HLMenu.Items
      as="span"
      className={classes.menuItemsWrapper}
      static
    >
      {({ open }) => (
        <Breakpoint>
          <Breakpoint.Zero>
            <Drawer show={open}>
              {children}
            </Drawer>
          </Breakpoint.Zero>
          <Breakpoint.Sm>
            <div
              className={classNames(classes.menuItems, {
                [classes.open]: open
              })}
              style={{ ...styles.popper, width, height }}
              ref={el => el && setPanelEl(el)}
              {...attributes.popper}
            >
              {buttonEl && (
                <span
                  className={classes.menuItemsArrow}
                  style={{
                    ...styles.arrow,
                    transform: styles.arrow ? `${styles.arrow.transform} rotate(${arrowRotation}deg)` : undefined,
                  }}
                  ref={el => el && setArrowEl(el)}
                />
              )}
              <div className={classes.menuItemsContent}>
                {children}
              </div>
            </div>
          </Breakpoint.Sm>
        </Breakpoint>
      )}
    </HLMenu.Items>
  )
}

const Item: React.FC<MenuItemProps> = ({
  children,
  className,
  color,
  href,
  rel,
  target,
  disabled,
  prefix,
  suffix,
  onClick,
}) => {
  const As = href ? "a" : "div"
  return (
    <HLMenu.Item>
      {({ active }) => (
        <As
          className={classNames(classes.menuItem, className, {
            [classes.active]: active,
            [classes.disabled]: disabled,
            [classes.menuItemSecondary]: color === "secondary",
            [classes.menuItemSuccess]: color === "success",
            [classes.menuItemWarning]: color === "warning",
            [classes.menuItemError]: color === "error",
            [classes.menuItemAlert]: color === "alert",
          })}
          href={href}
          rel={rel}
          target={target}
          onClick={onClick}
        >
          {prefix && (
            <span className={classes.menuItemPrefix}>{prefix}</span>
          )}
          {children}
          {suffix && (
            <span className={classes.menuItemSuffix}>{suffix}</span>
          )}
        </As>
      )}
    </HLMenu.Item>
  )
}

const Separator: React.FC = () => (
  <hr className={classes.menuItemSeparator} />
)

const MenuContext = React.createContext<{
  buttonEl: HTMLElement | undefined,
  setButtonEl: (btn: HTMLElement) => void,
  panelEl: HTMLElement | undefined,
  setPanelEl: (btn: HTMLElement) => void,
} | undefined>(undefined)

const Menu: React.FC<MenuProps> & {
  Item: typeof Item,
  Button: typeof Button,
  Items: typeof Items,
  Separator: typeof Separator,
} = ({ children, className }) => {
  const [buttonEl, setButtonEl] = useState<HTMLElement>()
  const [panelEl, setPanelEl] = useState<HTMLElement>()

  return (
    <HLMenu as="div" className={classNames(classes.menu, className)}>
      <MenuContext.Provider
        value={{
          buttonEl,
          setButtonEl,
          panelEl,
          setPanelEl,
        }}
      >
        {children}
      </MenuContext.Provider>
    </HLMenu>
  )
}
Menu.Item = Item
Menu.Button = Button
Menu.Items = Items
Menu.Separator = Separator

export default Menu
