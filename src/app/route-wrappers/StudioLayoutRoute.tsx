import React from "react"
import { Outlet } from "react-router-dom"

import StudioLayout from "@components/layout/StudioLayout"

const StudioLayoutRoute: React.FC = () => {
  return (
    <StudioLayout>
      <Outlet />
    </StudioLayout>
  )
}

export default StudioLayoutRoute
