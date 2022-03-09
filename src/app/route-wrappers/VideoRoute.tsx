import React from "react"
import { Navigate, Outlet, useParams } from "react-router-dom"

import routes from "@routes"

const VideoRoute: React.FC = () => {
  const { hash } = useParams()

  return hash ? <Outlet /> : <Navigate replace to={routes.getHomeLink()} />
}

export default VideoRoute
