import React from "react"
import { Link } from "react-router-dom"

import classes from "@styles/components/common/NotFound.module.scss"

import routes from "@routes"

type NotFoundProps = {
  message?: string
  showBackLink?: boolean
}

const NotFound: React.FC<NotFoundProps> = ({
  message = "This page cannot be found",
  showBackLink
}) => {
  return (
    <div className={classes.notFound}>
      <h1 className={classes.notFoundTitle}>
        <span className={classes.notFoundCode}>404</span>
        <span className={classes.notFoundMessage}>{message}</span>
      </h1>
      {showBackLink && (
        <Link to={routes.getHomeLink()}>
          ← Back to Etherna
        </Link>
      )}
    </div>
  )
}

export default NotFound
