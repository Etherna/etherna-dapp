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

import classes from "@styles/components/user/AlphaPassButton.module.scss"

import Button from "@common/Button"

type AlphaPassButtonProps = {
  children?: React.ReactNode
}

const AlphaPassButton: React.FC<AlphaPassButtonProps> = ({ children }) => {
  return (
    <Button
      className={classes.alphaPassButton}
      href="https://etherna.io/alpha-pass"
      as="a"
      type="button"
      modifier="transparent"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </Button>
  )
}

export default AlphaPassButton
