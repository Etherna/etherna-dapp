import React from "react"

import classes from "@styles/components/common/ComingSoon.module.scss"
import { ReactComponent as SoonIllustration } from "@assets/backgrounds/soon-illustration.svg"

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
