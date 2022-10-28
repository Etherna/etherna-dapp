/* eslint-disable no-console */
import type { State, StateCreator, StoreMutatorIdentifier, Mutate, StoreApi } from "zustand"

interface ISyncAction<TPayload = any> {
  type: string
  payload?: TPayload
  error?: Error
}

type Logger = <
  T extends State,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, [...Mps, ["logger", unknown]], Mcs>
) => StateCreator<T, Mps, [["logger", unknown], ...Mcs]>

declare module "zustand" {
  interface StoreMutators<S, A> {
    logger: Write<Cast<S, object>, {}>
  }
}

type LoggerImpl = <T extends State>(
  f: PopArgument<StateCreator<T, [], []>>
) => PopArgument<StateCreator<T, [], []>>

const logger: LoggerImpl = f => (set, get, _store) => {
  type T = ReturnType<typeof f>

  const store = _store as Mutate<StoreApi<T>, [["logger", ISyncAction]]>

  if (import.meta.env.DEV) {
    store.subscribe((newState, oldState) => {
      console.debug("state changed", newState)
    })
  }

  return f(set, get, _store)
}

type PopArgument<T extends (...a: never[]) => unknown> = T extends (
  ...a: [...infer A, infer _]
) => infer R
  ? (...a: A) => R
  : never

type Write<T extends object, U extends object> = Omit<T, keyof U> & U
type Cast<T, U> = T extends U ? T : U

export default logger as unknown as Logger
