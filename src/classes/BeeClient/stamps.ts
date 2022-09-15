import type BeeClient from "."
import type { BatchId, PostageBatch, RequestOptions } from "./types"
import { STAMPS_DEPTH_MIN } from "./utils/contants"

const stampsEndpoint = "/stamps"

export default class Stamps {
  constructor(private instance: BeeClient) {}

  async create(
    depth = STAMPS_DEPTH_MIN,
    amount: bigint | string = "10000000",
    options?: RequestOptions
  ): Promise<BatchId> {
    const token = this.instance.auth.token

    const resp = await this.instance.request.post<{ batchID: BatchId }>(
      `${stampsEndpoint}/${amount}/${depth}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
        timeout: options?.timeout,
        signal: options?.signal,
      }
    )
    const batchId = resp.data.batchID

    return batchId
  }

  async download(batchId: BatchId, options?: RequestOptions): Promise<PostageBatch> {
    const token = this.instance.auth.token

    const postageResp = await this.instance.request.get<PostageBatch>(
      `${stampsEndpoint}/${batchId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
        timeout: options?.timeout,
        signal: options?.signal,
      }
    )
    return postageResp.data
  }

  async downloadAll(options?: RequestOptions): Promise<PostageBatch[]> {
    const token = this.instance.auth.token

    const postageResp = await this.instance.request.get<{ stamps: PostageBatch[] }>(
      stampsEndpoint,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
        timeout: options?.timeout,
        signal: options?.signal,
      }
    )
    return postageResp.data.stamps
  }

  async fetchBestBatchId(): Promise<BatchId> {
    const usableBatch = (batch: PostageBatch) =>
      batch.usable && this.getBatchPercentUtilization(batch) < 1

    if (this.instance.postageBatches.length > 0) {
      const batch = this.instance.postageBatches.filter(usableBatch)[0]
      if (batch) {
        return batch.batchID
      }
    }
    const batches = await this.downloadAll()
    const usableBatches = batches.filter(usableBatch)
    const batchId = usableBatches[0]?.batchID

    if (!batchId) {
      throw new Error("No usable batches found")
    }

    return batchId
  }

  /**
   * Topup batch (increase TTL)
   *
   * @param batchId Id of the swarm batch
   * @param byAmount Amount to add to the batch
   */
  async topup(
    batchId: BatchId,
    byAmount: bigint | string,
    options?: RequestOptions
  ): Promise<boolean> {
    const token = this.instance.auth.token

    await this.instance.request.patch<{ batchID: BatchId }>(
      `${stampsEndpoint}/topup/${batchId}/${byAmount}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
        timeout: options?.timeout,
        signal: options?.signal,
      }
    )

    return true
  }

  /**
   * Dillute batch (increase size)
   *
   * @param batchId Id of the swarm batch
   * @param depth New depth of the batch
   */
  async dilute(batchId: BatchId, depth: number, options?: RequestOptions): Promise<boolean> {
    const token = this.instance.auth.token

    await this.instance.request.patch<{ batchID: BatchId }>(
      `${stampsEndpoint}/dilute/${batchId}/${depth}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
        timeout: options?.timeout,
        signal: options?.signal,
      }
    )

    return true
  }

  // Utils

  private getBatchPercentUtilization = (batch: PostageBatch) => {
    const { utilization, depth, bucketDepth } = batch
    return utilization / 2 ** (depth - bucketDepth)
  }
}
