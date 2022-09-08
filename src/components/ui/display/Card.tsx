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

export type CardProps = {
  children: React.ReactNode
  actions?: React.ReactNode
  title?: string
}

const Card: React.FC<CardProps> = ({ children, actions, title }) => {
  return (
    <div
      className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
      data-component="card"
    >
      {(title || actions) && (
        <header className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <h2 className="break-words text-base font-semibold">{title}</h2>
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </header>
      )}
      <div className="flex-grow">{children}</div>
    </div>
  )
}

export default Card
