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
import { Outlet } from "react-router-dom"

import SigninMessage from "@components/navigation/SigninMessage"
import useSelector from "@state/useSelector"

const SignedInRoute: React.FC = () => {
  const { isSignedIn } = useSelector(state => state.user)
  const isSigningIn = isSignedIn === undefined
  const isFullySignedIn = isSignedIn === true

  return isSigningIn ? null : isFullySignedIn
    ? <Outlet />
    : <SigninMessage />
}

export default SignedInRoute