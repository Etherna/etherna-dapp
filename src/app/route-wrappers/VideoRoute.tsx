import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import routes from "@routes"

const VideoRoute: React.FC = () => {
  const { search } = useLocation()
  const query = new URLSearchParams(search)
  const hasVideoParam = query.has("v") && query.get("v") !== ""

  return hasVideoParam ? <Outlet /> : <Navigate replace to={routes.getHomeLink()} />
}

export default VideoRoute
