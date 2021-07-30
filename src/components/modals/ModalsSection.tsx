import React from "react"

import UnsupportedBrowserModal from "./UnsupportedBrowserModal"
import ShortcutModal from "./ShortcutModal"
import ImageCropModal from "./ImageCropModal"
import ExtensionEditorModal from "./ExtensionEditorModal"
import useSelector from "@state/useSelector"

const ModalsSection = () => {
  const {
    showUnsupportedModal,
    isEditingShortcut,
    isCroppingImage,
  } = useSelector(state => state.ui)
  return (
    <section>
      <UnsupportedBrowserModal show={showUnsupportedModal} />

      <ShortcutModal show={isEditingShortcut} />

      <ImageCropModal show={isCroppingImage} />

      <ExtensionEditorModal />
    </section>
  )
}

export default ModalsSection
