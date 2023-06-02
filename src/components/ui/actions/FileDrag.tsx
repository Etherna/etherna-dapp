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

import React, { useCallback, useState } from "react"

import { FilmIcon, PlusIcon } from "@heroicons/react/24/outline"

import classNames from "@/utils/classnames"

export type FileDragProps = {
  label?: string
  onFileSelected(file: File): void
}

const FileDrag: React.FC<FileDragProps> = ({
  label = "Drag and drop a file here",
  onFileSelected,
}) => {
  const [dragEnter, setDragEnter] = useState(false)
  const [dragError, setDragError] = useState(false)

  const handleFileSelect = useCallback(
    (files: FileList | File[] | null) => {
      const file = files?.[0]
      if (file) {
        if (file.type.startsWith("video/")) {
          onFileSelected(file)
        } else {
          alert("Please select a video file")
        }
      }
    },
    [onFileSelected]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files)
    },
    [handleFileSelect]
  )

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    setDragEnter(true)
    const files = [...e.dataTransfer.files]
    const file = files[0]
    setDragError(!file.type?.startsWith("video/"))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    setDragEnter(false)
    setDragError(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      const files = [...e.dataTransfer.files]
      handleFileSelect(files)
    },
    [handleFileSelect]
  )

  return (
    <label
      htmlFor="file-drag"
      className="flex aspect-video w-full cursor-pointer"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={classNames(
          "flex w-full flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900",
          {
            "border-primary-500 dark:border-primary-500": dragEnter,
            "border-red-500 dark:border-red-500": dragError,
          }
        )}
      >
        <div className="flex flex-col">
          {dragEnter ? <PlusIcon height={48} /> : <FilmIcon height={48} />}
          <p className="mt-3 text-lg">{label}</p>
        </div>
        <input
          type="file"
          id="file-drag"
          className="hidden"
          accept="video/*"
          onChange={handleFileChange}
        />
      </div>
    </label>
  )
}

export default FileDrag
