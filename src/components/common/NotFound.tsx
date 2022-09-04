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

import routes from "@/routes"

type NotFoundProps = {
  message?: string
  showBackLink?: boolean
}

const NotFound: React.FC<NotFoundProps> = ({
  message = "This page cannot be found",
  showBackLink,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl flex items-center -mt-16">
        <span className="py-3 pr-6 mr-6 border-r border-gray-300 dark:border-gray-600">404</span>
        <span className="font-normal text-base">{message}</span>
      </h1>
      {showBackLink && <Link to={routes.home}>← Back to Etherna</Link>}
    </div>
  )
}

export default NotFound
