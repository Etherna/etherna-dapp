import React, { useRef, useState } from "react"

import "./comment-form.scss"
import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"

import Button from "@common/Button"
import Avatar from "@components/user/Avatar"
import { IndexVideoComment } from "@classes/EthernaIndexClient/types"
import useSelector from "@state/useSelector"
import { showError } from "@state/actions/modals"

type CommentFormProps = {
  videoHash: string
  onCommentPosted?(comment: IndexVideoComment): void
}

const CommentForm: React.FC<CommentFormProps> = ({ videoHash, onCommentPosted }) => {
  const [text, setText] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const { isSignedIn, address } = useSelector(state => state.user)
  const { avatar } = useSelector(state => state.profile)
  const { indexClient } = useSelector(state => state.env)

  if (!isSignedIn) return null

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsPosting(true)

    try {
      const comment = await indexClient.videos.postComment(videoHash, text)

      onCommentPosted?.(comment)
      setText("")
      setIsFocused(false)
      inputRef.current?.blur()
    } catch (error) {
      showError("Cannot post the comment", error.message)
    }

    setIsPosting(false)
  }

  const onCancel = () => {
    setText("")
    setIsFocused(false)
    inputRef.current?.blur()
  }

  return (
    <form className="comment-form" onSubmit={onSubmit}>
      <div className="comment-form-avatar">
        <Avatar image={avatar} address={address} />
      </div>

      <textarea
        ref={inputRef}
        className="comment-form-input"
        placeholder="Add a public comment"
        value={text}
        disabled={isPosting}
        onChange={e => setText(e.target.value)}
        onFocus={() => setIsFocused(true)}
      />

      {isFocused && (
        <div className="comment-form-actions">
          <Button aspect="transparent" action={onCancel} disabled={isPosting}>Cancel</Button>
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
