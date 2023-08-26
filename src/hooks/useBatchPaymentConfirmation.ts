import { calcBatchPrice, getBatchCapacity } from "@etherna/sdk-js/utils"

import useConfirmation from "./useConfirmation"
import { convertBytes } from "@/utils/converters"

export default function useBatchPaymentConfirmation() {
  const { waitConfirmation } = useConfirmation()

  return {
    async waitPaymentConfirmation(depth: number, amount: string) {
      return await waitConfirmation(
        "A postage batch transaction is needed",
        `To create/update a postage batch, a transaction is needed. The transaction will cost ${calcBatchPrice(
          depth,
          amount
        )} for a batch of size ~${convertBytes(getBatchCapacity(depth)).readable}.`,
        "Proceed"
      )
    },
  }
}
