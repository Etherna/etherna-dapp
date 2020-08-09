import { useEffect } from "react"
import NProgress from "nprogress"

import "./page-loader.scss"

const PageLoader = () => {
  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
    })
    NProgress.start()

    return () => NProgress.done()
  }, [])

  return ""
}

export default PageLoader
