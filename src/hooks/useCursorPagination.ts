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

import { useEffect, useState } from "react"

interface UseCursorPaginationOptions {
  seedCount?: number
  nextCount?: number
  total: number
}

export function useCursorPagination(opts: UseCursorPaginationOptions) {
  const [cursor, setCursor] = useState({
    start: 0,
    end: 0,
  })
  const seedCount = opts.seedCount ?? 24
  const nextCount = opts.nextCount ?? 12

  useEffect(() => {
    setCursor({
      start: 0,
      end: seedCount,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.total, opts.seedCount, opts.nextCount])

  const next = () => {
    if (cursor.end >= opts.total) return

    const start = cursor.end + 1
    const end = Math.min(start + nextCount, opts.total)

    setCursor({
      start,
      end,
    })
  }

  const hasMore = cursor.end < opts.total

  return {
    cursor,
    hasMore,
    next,
  }
}
