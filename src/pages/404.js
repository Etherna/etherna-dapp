import React from "react"
import { Link } from "react-router-dom"

import SEO from "@components/layout/SEO"
import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import Routes from "@routes"

const NotFoundPage = () => {
    return (
        <LayoutWrapper emptyLayout={true}>
            <div className="bg-gray-100 h-screen">
                <SEO title="404: Not found" />
                <div className="row text-gray-900 py-32">
                    <div className="col md:w-1/2 px-20">
                        <img src={require("@svg/backgrounds/404-illustration.svg")} alt="Page not found" className="mx-auto my-12"/>
                    </div>
                    <div className="col md:w-1/2 px-20">
                        <h2 className="leading-tight">
                            Oops! <br/>
                            Page not found
                        </h2>
                        <p className="text-gray-700">The page you are looking for doesn't exist</p>

                        <h3 className="mt-12">Resources</h3>
                        <nav className="flex flex-col">
                            <Link to={Routes.getHomeLink()}>Explore videos →</Link>
                            <Link to={Routes.getChannelsLink()}>Channels →</Link>
                            <a href="https://etherna.io/blog" target="_blank" rel="noopener noreferrer">Blog →</a>
                            <a href="https://index.etherna.io/swagger" target="_blank" rel="noopener noreferrer">API →</a>
                        </nav>
                    </div>
                </div>
            </div>
        </LayoutWrapper>
    )
}

export default NotFoundPage
