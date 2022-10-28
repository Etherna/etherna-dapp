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

import { ProgressBar, Spinner } from "@/components/ui/display"

type FileUploadProgressProps = {
  progress: number
  color?: "primary" | "rainbow"
  isPreloading?: boolean
  uploadText?: string
  processingText?: string
  preloadingText?: string
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  progress,
  color,
  isPreloading,
  uploadText,
  processingText = "Processing data (it might take several seconds)",
  preloadingText = "Processing data",
}) => {
  const isProcessing = progress >= 100
  const isUploading = !isPreloading && progress < 100

  return (
    <div className="flex w-full flex-wrap items-center">
      {!isProcessing && (
        <div className="w-full flex-grow">
          <ProgressBar color={color} progress={progress} indeterminate={isPreloading} />
        </div>
      )}
      <span className="mt-1.5 flex w-full items-center space-x-3 text-sm">
        {isProcessing && <Spinner size={26} height={4} type="bouncing-line" />}
        {isProcessing && <p>{processingText}</p>}
        {isUploading && <p>{uploadText || `Uploading (${progress}%)`}</p>}
        {isPreloading && <p>{preloadingText}</p>}
      </span>
    </div>
  )
}

export default FileUploadProgress
