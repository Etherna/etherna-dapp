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
import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import classNames from "classnames"

import { ArrowNarrowLeftIcon } from "@heroicons/react/solid"

import { Button } from "@/components/ui/actions"
import useMounted from "@/hooks/useMounted"

type StudioEditViewProps = {
  children?: React.ReactNode
  title: string
  saveLabel?: string
  backTo?: string
  canSave?: boolean
  actions?: React.ReactNode
  backPrompt?(): Promise<boolean>
  onSave?(): Promise<void>
}

const StudioEditView: React.FC<StudioEditViewProps> = ({
  children,
  title,
  saveLabel = "Save",
  canSave,
  backTo,
  actions,
  backPrompt,
  onSave,
}) => {
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const mounted = useMounted()

  const handleBack = async (e: React.MouseEvent) => {
    if (backPrompt) {
      e.preventDefault()
      const ok = await backPrompt()
      ok && navigate(backTo!)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    if (onSave) {
      await onSave()
    }
    mounted.current && setSaving(false)
  }

  return (
    <div className="max-w-screen-lg">
      <div className="flex items-center mb-4 flex-wrap md:flex-nowrap">
        {backTo && (
          <Link
            to={backTo}
            className={classNames(
              "flex p-1 w-8 h-8 rounded-full mr-3",
              "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:text-inherit"
            )}
            onClick={handleBack}
          >
            <ArrowNarrowLeftIcon className="h-5 m-auto" aria-hidden />
          </Link>
        )}

        <h2 className="text-lg lg:text-xl">{title}</h2>

        <div className="my-1 ml-auto flex items-center flex-wrap md:flex-nowrap space-x-4">
          {actions}
          <Button
            loading={saving}
            onClick={handleSave}
            disabled={canSave !== undefined && !canSave}
          >
            {saveLabel}
          </Button>
        </div>
      </div>

      {children}
    </div>
  )
}

export default StudioEditView
