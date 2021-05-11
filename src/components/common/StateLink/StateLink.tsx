import React from "react"
import { Link, LinkProps } from "react-router-dom"
import omit from "lodash/omit"

type StateLinkExtraProps = {
  state?: any
}

const StateLink: React.FC<LinkProps & StateLinkExtraProps> = (props) => {
  const updateState = () => {
    window.routeState = props.state
  }

  return (
    <Link {...(omit(props, "state"))} onMouseDown={updateState}>
      {props.children}
    </Link>
  )
}

export default StateLink
