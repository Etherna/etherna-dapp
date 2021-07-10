import React from "react"

import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import ShortcutsEditor from "@components/settings/ShortcutsEditor"

const Shortcuts = () => (
  <AppLayoutWrapper>
    <SEO title="Shortcuts" />

    <div className="container my-8 px-4">
      <h1>Shortcuts</h1>

      <h2>Player</h2>
      <ShortcutsEditor namespace="PLAYER" />
    </div>
  </AppLayoutWrapper>
)

export default Shortcuts
