import React, { useMemo } from "react"

import Alert from "@common/Alert"
import Button from "@common/Button"
import useSelector from "@state/useSelector"
import routes from "@routes"

const CantUploadAlert: React.FC = () => {
  const { batches } = useSelector(state => state.user)

  const [loading, noBatches, noUsableBatches] = useMemo(() => {
    const loading = batches == null
    const noBatches = batches && batches.length === 0
    const noUsableBatches = batches && batches.every(batch => !batch.usable)
    return [loading, noBatches, noUsableBatches]
  }, [batches])

  const title = useMemo(() => {
    if (loading) return "You storage is loading"
    if (noBatches) return "We are creating you first storage"
    if (noUsableBatches) return "Your storage is not usable"
  }, [loading, noBatches, noUsableBatches])

  if (!loading && !noBatches && !noUsableBatches) return null

  return (
    <Alert className="my-6" type="warning" title={title}>
      You might not be able to upload yet. <br />
      Come back when your storage is ready.

      <div className="mt-3">
        <Button as="a" href={routes.getStudioStorageLink()}>
          Check your storage
        </Button>
      </div>
    </Alert>
  )
}

export default CantUploadAlert
