export default class FlagEnumManager {
  constructor(private value: number = 0) {
  }

  public get() {
    return this.value
  }

  public set(value: number): this {
    this.value = value
    return this
  }

  public has(key: number): boolean {
    return !!(this.value & key)
  }

  public add(key: number): this {
    this.value |= key
    return this
  }

  public delete(key: number): this {
    this.value &= ~key
    return this
  }

  public toggle(key: number): this {
    this.has(key) ? this.delete(key) : this.add(key)
    return this
  }
}
