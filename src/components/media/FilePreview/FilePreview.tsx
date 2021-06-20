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

import React from "react"

import Button from "@common/Button"
import { isMimeImage } from "@utils/mimeTypes"

type FilePreviewProps = {
  previewUrl?: string
  contentType?: string
  disabled?: boolean
  onRemoveFile?: () => void
}

const FilePreview: React.FC<FilePreviewProps> = ({
  previewUrl,
  contentType,
  disabled,
  onRemoveFile
}) => {
  const askToRemoveFile = () => {
    if (window.confirm("Remove the upload file?")) {
      onRemoveFile?.()
    }
  }

  return (
    <>
      {previewUrl && isMimeImage(contentType ?? "") ? (
        <img src={previewUrl} alt="" />
      ) : (
        <p>
          <span role="img" aria-label="Completed">✅</span> Upload completed!
        </p>
      )}

      <Button
        size="small"
        aspect="secondary"
        className="mt-2"
        action={askToRemoveFile}
        disabled={disabled}
      >
        Remove
      </Button>
    </>
  )
}

export default FilePreview
