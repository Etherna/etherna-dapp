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

import "./file-upload-progress.scss"

import ProgressBar from "@common/ProgressBar"

type FileUploadProgressProps = {
  progress: number
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  progress,
}) => {
  if (progress === 0) return null

  return (
    <div className="file-upload-progress">
      <ProgressBar progress={progress} />
      <span className="file-upload-progress-value">
        {progress}%
      </span>
      <span className="file-upload-progress-text">
        {progress < 100 ? <p>Uploading...</p> : <p>Processing...</p>}
      </span>
    </div>
  )
}

export default FileUploadProgress
