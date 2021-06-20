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

import "./layout.scss"

import { LayoutContextProvider, useStateValue } from "./LayoutContext"
import Header from "@components/layout/Header"
import Sidebar from "@components/layout/Sidebar"
import Modals from "@components/modals/ModalsSection"

const Layout: React.FC = ({ children }) => {
  return (
    <LayoutContextProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutContextProvider>
  )
}

const LayoutContent: React.FC = ({ children }) => {
  const [state] = useStateValue()
  const { emptyLayout, hideSidebar } = state

  if (emptyLayout) {
    return <main>{children}</main>
  }

  return (
    <>
      <Header />
      {!hideSidebar && <Sidebar />}
      <main>{children}</main>
      <Modals />
    </>
  )
}

export default Layout
