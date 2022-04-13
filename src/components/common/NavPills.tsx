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
import classNames from "classnames"

import classes from "@styles/components/common/NavPills.module.scss"

type NavPillsProps = {
  children?: React.ReactNode
  className?: string
  vertical?: boolean
}

const NavPills: React.FC<NavPillsProps> = ({ children, className, vertical }) => {
  return (
    <nav
      className={classNames(classes.navPills, className, {
        [classes.vertical]: vertical,
      })}
    >
      {React.Children.map(children, el => React.cloneElement(el as any, { vertical }))}
    </nav>
  )
}

export default NavPills
