import React from "react"

import Container from "@common/Container"
import AppLayoutWrapper from "@components/layout/AppLayoutWrapper"
import SEO from "@components/layout/SEO"
import ShortcutsEditor from "@components/settings/ShortcutsEditor"

const Shortcuts = () => (
  <AppLayoutWrapper>
    <SEO title="Shortcuts" />

    <Container className="my-8">
      <h1>Shortcuts</h1>

      <h2>Player</h2>
      <ShortcutsEditor namespace="PLAYER" />
    </Container>
  </AppLayoutWrapper>
)

export default Shortcuts
