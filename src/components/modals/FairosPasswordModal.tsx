import React, { useState } from "react"

import { ReactComponent as Spinner } from "@svg/animated/spinner.svg"
import { ReactComponent as SignatureIcon } from "@svg/icons/signature-required-icon.svg"

import Button from "@common/Button"
import Modal from "@common/Modal"
import useSelector from "@state/useSelector"
import { showError, toggleFairosPasswordModal } from "@state/actions/modals"

type FairosPasswordModalProps = {
  show?: boolean
}

const FairosPasswordModal: React.FC<FairosPasswordModalProps> = ({ show }) => {
  const [password, setPassword] = useState("")
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const { fairosClient } = useSelector(state => state.env)

  const openPod = async () => {
    setLoading(true)
    setError(undefined)

    try {
      await fairosClient.pod.openDefaultPod(password)
      close()
    } catch (error) {
      const username = localStorage.getItem("fairdriveUsername")
      if (await fairosClient.user.isLoggedIn(username ?? "")) {
        close()
      } else {
        setError("Cannot open pod: " + error.message + ". Try to logout and login again.")
      }
    }

    setLoading(false)
  }

  const close = () => {
    setPassword("")
    toggleFairosPasswordModal(false)
  }

  return (
    <Modal
      show={show ?? false}
      showCloseButton={true}
      showCancelButton={false}
      title="Open Fairdrive POD"
      icon={<SignatureIcon />}
      footerButtons={
        <Button aspect="secondary" action={openPod}>
          {isLoading ? (
            <Spinner width="30" />
          ) : (
            "Open connection"
          )}
        </Button>
      }
      onClose={close}
    >
      <p>
        Enter your Fairdrive password to continue...
      </p>
      <form>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
      </form>

      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}
    </Modal>
  )
}

export default FairosPasswordModal
