import React, { createContext } from "react"

import type { MatomoInstance } from "./types"

export const AnalyticsContext = createContext<MatomoInstance | null>(null)

export interface AnalyticsProviderProps {
  children?: React.ReactNode
  value: MatomoInstance
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = function ({ children, value }) {
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}
