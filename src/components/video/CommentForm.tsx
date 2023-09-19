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

import React, { useCallback, useRef, useState } from "react"

import { ReactComponent as Spinner } from "@/assets/animated/spinner.svg"

import MarkdownEditor from "@/components/common/MarkdownEditor"
import { Button } from "@/components/ui/actions"
import { Avatar } from "@/components/ui/display"
import useCharaterLimits from "@/hooks/useCharaterLimits"
import useErrorMessage from "@/hooks/useErrorMessage"
import useClientsStore from "@/stores/clients"
import useUserStore from "@/stores/user"
import { cn } from "@/utils/classnames"

import type { IndexVideoComment } from "@etherna/sdk-js/clients"

type CommentFormProps = {
  indexReference: string
  onCommentPosted?(comment: IndexVideoComment): void
}

const CommentForm: React.FC<CommentFormProps> = ({ indexReference, onCommentPosted }) => {
  const [text, setText] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [hasExceededLimit, setHasExceededLimit] = useState(false)
  const address = useUserStore(state => state.address)
  const avatar = useUserStore(state => state.profile?.avatar)
  const isSignedIn = useUserStore(state => state.isSignedInIndex)
  const indexClient = useClientsStore(state => state.indexClient)
  const { characterLimits, isFetching, fetchCharLimits } = useCharaterLimits()
  const resetEditor = useRef<() => void>()
  const { showError } = useErrorMessage()

  const blurEditor = useCallback(() => {
    document.body.focus()
  }, [])

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      setIsPosting(true)

      try {
        const comment = await indexClient.videos.postComment(indexReference, text)

        onCommentPosted?.(comment)
        setText("")
        setIsFocused(false)
        blurEditor()
        resetEditor.current?.()
      } catch (error: any) {
        showError("Cannot post the comment", error.message)
      }

      setIsPosting(false)
    },
    [text, indexClient.videos, indexReference, blurEditor, onCommentPosted, showError]
  )

  const onCancel = useCallback(() => {
    setText("")
    setIsFocused(false)
    blurEditor()
    resetEditor.current?.()
  }, [blurEditor])

  const onFocus = useCallback(() => {
    setIsFocused(true)
    if (!characterLimits && !isFetching) {
      fetchCharLimits()
    }
  }, [characterLimits, isFetching, fetchCharLimits])

  if (!isSignedIn) return null

  return (
    <form className="mt-8 flex flex-wrap items-start space-x-2" onSubmit={onSubmit}>
      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 md:h-10 md:w-10">
        <Avatar className="h-full w-full" image={avatar} address={address} />
      </div>

      <MarkdownEditor
        className={cn("flex-1 [&_.DraftEditor-editorContainer]:min-h-4", {
          "pb-0": !isFocused,
        })}
        toolbarClassName={cn({
          hidden: !isFocused,
        })}
        charLimitClassName={cn({
          hidden: !isFocused,
        })}
        placeholder="Add a public comment"
        initialValue={undefined}
        charactersLimit={characterLimits?.comment}
        onChange={setText}
        onFocus={onFocus}
        onCharacterLimitChange={setHasExceededLimit}
        disabled={isPosting}
        ref={editor => (resetEditor.current = editor?.reset)}
      />

      {isFocused && (
        <div className="mt-2 flex w-full items-center justify-end space-x-2">
          <Button color="transparent" onClick={onCancel} disabled={isPosting || isFetching}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPosting || !text || hasExceededLimit}>
            {isPosting ? <Spinner width={20} height={20} /> : "Comment"}
          </Button>
        </div>
      )}
    </form>
  )
}

export default CommentForm
