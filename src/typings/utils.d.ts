export {}

declare global {
  type Prettify<T> = {
    [K in keyof T]: T[K]
  } & {}

  type Expect<T extends true> = T
  type ExpectTrue<T extends true> = T
  type ExpectFalse<T extends false> = T
  type IsTrue<T extends true> = T
  type IsFalse<T extends false> = T

  type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false
  type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true

  // https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
  type IsAny<T> = 0 extends 1 & T ? true : false
  type NotAny<T> = true extends IsAny<T> ? false : true

  type Debug<T> = { [K in keyof T]: T[K] }
  type MergeInsertions<T> = T extends object ? { [K in keyof T]: MergeInsertions<T[K]> } : T

  type Alike<X, Y> = Equal<MergeInsertions<X>, MergeInsertions<Y>>

  type ExpectExtends<VALUE, EXPECTED> = EXPECTED extends VALUE ? true : false
  type ExpectValidArgs<FUNC extends (...args: any[]) => any, ARGS extends any[]> =
    ARGS extends Parameters<FUNC> ? true : false

  type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
  ) => void
    ? I
    : never

  type FlattenObject<T> = T extends object
    ? T extends infer O
      ? { [K in keyof O]: K extends string ? `${K}` | FlattenObject<O[K]> : never }[keyof O]
      : never
    : never

  type ExtractFields<T> = T extends object ? T[keyof T] : never

  type RequiredProps<T> = {
    [P in keyof T]-?: NonNullable<T[P]>
  }

  type PartialNullable<T> = {
    [P in keyof T]?: T[P] | null
  }

  type UnionToTuple<T> = (
    (T extends any ? (t: T) => T : never) extends infer U
      ? (U extends any ? (u: U) => any : never) extends (v: infer V) => any
        ? V
        : never
      : never
  ) extends (_: any) => infer W
    ? [...UnionToTuple<Exclude<T, W>>, W]
    : []

  type UnionExclude<T extends readonly unknown[], E extends readonly unknown[]> = UnionToTuple<
    Exclude<T[number], E[number]>
  >
}
