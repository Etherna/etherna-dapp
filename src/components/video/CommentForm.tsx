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

import React, { useRef, useState } from "react"
import type { EditorState } from "draft-js"

import classes from "@styles/components/video/CommentForm.module.scss"
import { ReactComponent as Spinner } from "@assets/animated/spinner.svg"

import Button from "@common/Button"
import TextField from "@common/TextField"
import MarkdownEditor from "@common/MarkdownEditor"
import Avatar from "@components/user/Avatar"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"
import type { IndexVideoComment } from "@definitions/api-index"
import classNames from "classnames"

type CommentFormProps = {
  indexReference: string
  onCommentPosted?(comment: IndexVideoComment): void
}

const CommentForm: React.FC<CommentFormProps> = ({ indexReference, onCommentPosted }) => {
  const [text, setText] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isPosting, setIsPosting] = useState(false)

  const { isSignedIn, address } = useSelector(state => state.user)
  const { avatar } = useSelector(state => state.profile)
  const { indexClient } = useSelector(state => state.env)

  if (!isSignedIn) return null

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsPosting(true)

    try {
      const comment = await indexClient.videos.postComment(indexReference, text)

      onCommentPosted?.(comment)
      setText("")
      setIsFocused(false)
      blurEditor()
    } catch (error: any) {
      showError("Cannot post the comment", error.message)
    }

    setIsPosting(false)
  }

  const onCancel = () => {
    setText("")
    setIsFocused(false)
    blurEditor()
  }

  const blurEditor = () => {
    document.body.focus()
  }

  return (
    <form className={classes.commentForm} onSubmit={onSubmit}>
      <div className={classes.videoCommentAvatar}>
        <Avatar image={avatar} address={address} />
      </div>

      <MarkdownEditor
        className={classNames(classes.commentFormInput, {
          [classes.hasFocus]: isFocused,
        })}
        placeholder="Add a public comment"
        value={text}
        charactersLimit={1000}
        onChange={setText}
        onFocus={() => setIsFocused(true)}
        disabled={isPosting}
      />

      {isFocused && (
        <div className={classes.commentFormActions}>
          <Button modifier="transparent" onClick={onCancel} disabled={isPosting}>Cancel</Button>
          <Button type="submit" disabled={isPosting || !text}>
            {isPosting ? (
              <Spinner width={20} height={20} />
            ) : (
              "Comment"
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

export default CommentForm
