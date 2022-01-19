import React from "react"

import classes from "@styles/components/layout/StudioLayout.module.scss"
import { ReactComponent as SparklesIcon } from "@assets/icons/sparkles.svg"
import { ReactComponent as VideoIcon } from "@assets/icons/movie.svg"
import { ReactComponent as LightBulbIcon } from "@assets/icons/light-bulb.svg"

import Container from "@common/Container"
import DropdownSidebar from "@components/navigation/DropdownSidebar"
import SidebarItem from "@components/navigation/SidebarItem"
import routes from "@routes"

const StudioLayout: React.FC = ({ children }) => {
  return (
    <Container fluid>
      <h1 className={classes.title}><SparklesIcon /> Creator Studio</h1>

      <div className={classes.content}>
        <DropdownSidebar>
          <SidebarItem
            to={routes.getStudioVideosLink()}
            title="Videos"
            iconSvg={<VideoIcon />}
            isActive={pathname => /\/studio\/videos/.test(pathname)}
            isResponsive={false}
          />
          <SidebarItem
            to={routes.getStudioCustomizeChannelLink()}
            title="Customize"
            iconSvg={<LightBulbIcon />}
            isActive={pathname => /\/studio\/channel/.test(pathname)}
            isResponsive={false}
          />
        </DropdownSidebar>
        {children}
      </div>
    </Container>
  )
}

export default StudioLayout
