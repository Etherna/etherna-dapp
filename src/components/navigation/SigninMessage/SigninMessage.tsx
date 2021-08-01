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

import "./signin-message.scss"

import SigninButton from "@components/user/SigninButton"

const SigninMessage: React.FC = () => {
  return (
    <div className="signin-message">
      <div className="signin-message-text">
        You must signin to visit this page.
      </div>

      <div className="signin-message-action">
        <SigninButton>Sign in</SigninButton>
      </div>
    </div>
  )
}

export default SigninMessage
