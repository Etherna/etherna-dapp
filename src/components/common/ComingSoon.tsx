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

import classes from "@/styles/components/common/ComingSoon.module.scss"
import { ReactComponent as SoonIllustration } from "@/assets/backgrounds/soon-illustration.svg"

type ComingSoonProps = {
  title?: string
  description?: string
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title = "Coming Soon!", description }) => {
  return (
    <div className={classes.comingSoon}>
      <div className={classes.comingSoonContent}>
        <h2 className={classes.comingSoonTitle}>{title}</h2>
        <SoonIllustration className={classes.comingSoonImage} aria-hidden />
        <p className={classes.comingSoonDescription}>{description}</p>
      </div>
    </div>
  )
}

export default ComingSoon
