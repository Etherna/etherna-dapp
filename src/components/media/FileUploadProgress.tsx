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

import { ProgressBar } from "@/components/ui/display"

type FileUploadProgressProps = {
  progress: number
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({ progress }) => {
  if (progress === 0) return null

  return (
    <div className="flex flex-wrap items-center w-full max-w-sm">
      <div className="w-auto flex-grow">
        <ProgressBar progress={progress} indeterminate={progress === 100} />
      </div>
      {progress < 100 && <span className="text-sm font-semibold ml-2">{progress}%</span>}
      <span className="text-sm w-full mt-1.5">
        {progress < 100 ? (
          <p>Uploading...</p>
        ) : (
          <p>Processing data (it might take several seconds)</p>
        )}
      </span>
    </div>
  )
}

export default FileUploadProgress
