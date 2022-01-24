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
import { Link, useHistory } from "react-router-dom"

import classes from "@styles/components/studio/StudioEditView.module.scss"
import { ReactComponent as ArrowLeftIcon } from "@assets/icons/arrow-left.svg"

import Button from "@common/Button"
import useMounted from "@hooks/useMounted"

type StudioEditViewProps = {
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
  const { push } = useHistory()
  const mounted = useMounted()

  const handleBack = async (e: React.MouseEvent) => {
    if (backPrompt) {
      e.preventDefault()
      const ok = await backPrompt()
      ok && push(backTo!)
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
    <div className={classes.studioEdit}>
      <div className={classes.studioEditToolbar}>
        {backTo && (
          <Link to={backTo} className={classes.studioEditBackButton} onClick={handleBack}>
            <ArrowLeftIcon />
          </Link>
        )}

        <h2 className={classes.studioEditTitle}>{title}</h2>

        <div className={classes.studioEditActions}>
          {actions}
          <Button loading={saving} onClick={handleSave} disabled={canSave !== undefined && !canSave}>
            {saveLabel}
          </Button>
        </div>
      </div>

      {children}
    </div>
  )
}

export default StudioEditView
