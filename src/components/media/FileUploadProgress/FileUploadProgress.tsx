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
import { Canceler } from "axios"

import Button from "@common/Button"
import ProgressBar from "@common/ProgressBar"

type FileUploadProgressProps = {
  progress: number
  disabled?: boolean
  canceler?: Canceler
  onCancelUpload?: () => void
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  progress,
  disabled,
  canceler,
  onCancelUpload
}) => {
  if (progress === 0) return null

  const handleCancel = () => {
    if (canceler) {
      canceler("User canceled the upload.")
    }
    onCancelUpload?.()
  }

  return (
    <>
      {progress < 100 ? <p>Uploading ({progress}%)...</p> : <p>Processing...</p>}
      <ProgressBar progress={progress} />
      <Button
        size="small"
        aspect="secondary"
        className="mt-2"
        action={handleCancel}
        disabled={disabled}
      >
        Cancel
      </Button>
    </>
  )
}

export default FileUploadProgress
