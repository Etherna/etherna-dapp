import { useEffect, useState } from "react"

export default function useSmartFetchCount(
  gridRef: React.RefObject<HTMLElement> | undefined,
  defaulSeed = 24,
  defaultFetch = 12
) {
  const [fetchCount, setFetchCount] = useState<number | null>(null)

  useEffect(() => {
    if (gridRef && !gridRef.current) return

    if (gridRef?.current) {
      const gridColsTemplate = getComputedStyle(gridRef.current).gridTemplateColumns
      const rowsGap = getComputedStyle(gridRef.current).rowGap
      const gridCols = gridColsTemplate.split(" ")
      const colWidth = parseInt(gridCols[0])
      const itemHeight = colWidth * 0.9 // ratio calculated by height/width of preview item with badge
      const pageHeight = window.screen?.availHeight || window.innerHeight
      const visibileRowsCount = Math.ceil(pageHeight / (itemHeight + parseInt(rowsGap)))

      const seedCount = Math.max(visibileRowsCount * gridCols.length, 6)
      // const loadMoreCount = gridCols.length * 3 // 3 more rows per load
      setFetchCount(seedCount || defaulSeed)
    } else {
      setFetchCount(defaulSeed)
    }
  }, [gridRef, defaulSeed])

  return fetchCount
}
