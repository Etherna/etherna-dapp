/* eslint-disable no-console */

import type { State, StateCreator, StoreMutatorIdentifier } from "zustand"

type Logger = <
  T extends State,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, [...Mps, ["logger", unknown]], Mcs>
) => StateCreator<T, Mps, [["logger", unknown], ...Mcs]>

declare module "zustand" {
  interface StoreMutators<S, A> {
    logger: Write<Cast<S, object>, {}>
  }
}

type LoggerImpl = <T extends unknown>(f: StateCreator<T, [], []>) => StateCreator<T, [], []>

const logger: LoggerImpl = f => (set, get, store) => {
  type T = ReturnType<typeof f>

  const loggedSet: typeof set = (...a) => {
    set(...a)
    if (import.meta.env.DEV) {
      console.group(`%c${"anonymous"}`, "color: #0f0; font-weight: bold")
      console.debug(get())
      console.groupEnd()
    }
  }
  store.setState = loggedSet

  return f(set, get, store)
}

type Write<T extends object, U extends object> = Omit<T, keyof U> & U
type Cast<T, U> = T extends U ? T : U

export default logger as unknown as Logger
