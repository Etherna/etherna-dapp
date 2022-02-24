/*
 *  Copyright 2021-present Etherna Sagl
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

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
