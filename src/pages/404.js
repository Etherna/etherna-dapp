import React from "react"

import SEO from "../components/layout/SEO"

const NotFoundPage = () => (
    <div className="bg-gray-100 h-screen">
        <SEO title="404: Not found" />
        <div className="container">
            <div className="row text-center text-blue-900 py-12">
                <div className="col">
                    <h2 className="mx-auto" style={{ fontSize: "10rem" }}>404</h2>
                    <h1 className="mx-auto">Page not found</h1>
                </div>
            </div>
        </div>
    </div>
)

export default NotFoundPage
