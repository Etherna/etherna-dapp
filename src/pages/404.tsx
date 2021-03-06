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

import { Link } from "react-router-dom"

import SEO from "@components/layout/SEO"
import LayoutWrapper from "@components/layout/DefaultLayout/LayoutWrapper"
import { ReactComponent as NotFoundImage } from "@svg/backgrounds/404-illustration.svg"
import Routes from "@routes"

const NotFoundPage = () => {
  return (
    <LayoutWrapper emptyLayout={true} hideSidebar>
      <div className="bg-gray-100 h-screen">
        <SEO title="404: Not found" />
        <div className="row text-gray-900 py-32">
          <div className="col md:w-1/2 px-20">
            <NotFoundImage className="mx-auto my-12" />
          </div>
          <div className="col md:w-1/2 px-20">
            <h2 className="leading-tight">
              Oops! <br />
              Page not found
            </h2>
            <p className="text-gray-700">The page you are looking for doesn't exist</p>

            <h3 className="mt-12">Resources</h3>
            <nav className="flex flex-col">
              <Link to={Routes.getHomeLink()}>Explore videos →</Link>
              <Link to={Routes.getProfilesLink()}>Profiles →</Link>
              <a href="https://etherna.io/blog" target="_blank" rel="noopener noreferrer">
                Blog →
              </a>
              <a href="https://index.etherna.io/swagger" target="_blank" rel="noopener noreferrer">
                API →
              </a>
            </nav>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default NotFoundPage
