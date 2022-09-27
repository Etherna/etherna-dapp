export {}

declare module "zustand" {
  interface StorageValue<S> {
    state: S
    version?: number
  }
}
