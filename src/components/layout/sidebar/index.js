import React from "react"

import "./sidebar.scss";
import MyChannel from "./my-channel"
import ReccomendedChannels from "./reccomended-channels"

const channels = [
    {
        imageUrl: '//yt3.ggpht.com/a/AGF-l7_W99JMwHKzSpg_W7z2vFiR5WkawWO4A1FUWQ=s176-c-k-c0x00ffffff-no-rj-mo',
        address: '0x34535345',
        name: 'Ludo Thorn'
    }
]

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidenav">
                <MyChannel />
                <ReccomendedChannels channels={channels} />
            </div>
            <small className="footer-notice">
                Copyright © {new Date().getFullYear()} etherna.io.
            </small>
        </aside>
    )
}

export default Sidebar