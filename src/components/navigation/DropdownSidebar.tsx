import React from "react"
import { useHistory, useLocation } from "react-router-dom"
import { Listbox } from "@headlessui/react"

import classes from "@styles/components/navigation/DropdownSidebar.module.scss"
import { ReactComponent as SelectorIcon } from "@assets/icons/selector.svg"
import classNames from "classnames"

type DropdownSidebarProps = {
  defaultTitle?: string
  className?: string
}

const DropdownSidebar: React.FC<DropdownSidebarProps> = ({ className, defaultTitle, children }) => {
  const { pathname } = useLocation()
  const { push } = useHistory()

  const isActive = (item: React.ReactElement): boolean => typeof item.props.isActive === "function"
    ? item.props.isActive(pathname)
    : !!item.props.isActive
  const activeItem = React.Children.toArray(children)
    .find(item => isActive(item as any)) as React.ReactElement | undefined

  const goTo = (path: string) => {
    push(path)
  }

  return (
    <Listbox as="aside" className={classNames(classes.dropdownSidebar, className)} value={pathname} onChange={goTo}>
      {({ open }) => (
        <>
          <Listbox.Button className={classes.dropdownSidebarSelector}>
            {activeItem?.props.iconSvg}
            {activeItem?.props.title ?? defaultTitle}
            <SelectorIcon className={classes.selectorIcon} />
          </Listbox.Button>

          <Listbox.Options className={classNames(classes.dropdownSidebarMenu, {
            [classes.open]: open
          })} static>
            {React.Children.map(children, (item: any, i) => (
              <Listbox.Option
                className={classNames(classes.dropdownSidebarOption)}
                value={item.props.to}
                key={i}
              >
                {({ active }) => (
                  <span className={classNames({ [classes.active]: active })}>
                    {item}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </>
      )}
    </Listbox>
  )
}

export default DropdownSidebar