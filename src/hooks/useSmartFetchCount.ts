import { useEffect, useState } from "react"

interface UseSmartFetchCountOptions {
  defaultSeed?: number
  rows?: number
}

export default function useSmartFetchCount(
  gridRef: React.RefObject<HTMLElement> | undefined,
  opts?: UseSmartFetchCountOptions
) {
  const [fetchCount, setFetchCount] = useState<number | null>(null)

  useEffect(() => {
    if (gridRef && !gridRef.current) return

    const defaultSeed = opts?.defaultSeed ?? 4
    const rows = opts?.rows

    if (gridRef?.current) {
      const gridColsTemplate = getComputedStyle(gridRef.current).gridTemplateColumns
      const rowsGap = getComputedStyle(gridRef.current).rowGap
      const gridCols = gridColsTemplate.split(" ")
      const colWidth = parseInt(gridCols[0])
      const itemHeight = colWidth * 0.9 // ratio calculated by height/width of preview item with badge
      const pageHeight = window.screen?.availHeight || window.innerHeight
      const visibileRowsCount = rows ?? Math.ceil(pageHeight / (itemHeight + parseInt(rowsGap)))

      const seedCount = visibileRowsCount * gridCols.length

      setFetchCount(seedCount || defaultSeed)
    } else {
      setFetchCount(defaultSeed)
    }
  }, [gridRef, opts])

  return fetchCount
}
