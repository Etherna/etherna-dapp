declare module "micro-down" {
  type MicroDownOptions = {
    preCode?: string
  }
  export function parse(text: string, options?: MicroDownOptions): string
  export function block(text: string, options?: MicroDownOptions): string
  export function inline(text: string): string
  export function inlineBlock(text: string, dontInline: boolean): string
}