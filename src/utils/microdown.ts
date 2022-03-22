import { parse } from "micro-down"

/**
 * Extend microdown capabilities
 *
 * @param md Markdown
 * @returns Markdown html
 */
export default function microdownEnhanced(md: string) {
  const htmls = md
    .split(/(?:\r?\n){2,}/)
    .map(l =>
      [" ", "\t", "#", "-", "*"].some(ch => l.startsWith(ch))
        ? parse(l)
        : `<p>${parse(l)}</p>`,
    )

  return htmls.join("\n\n")
}
