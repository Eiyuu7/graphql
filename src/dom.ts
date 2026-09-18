/**
 * `$` throws rather than returning null. every element it is asked for is
 * written into index.html, meaning a miss is a broken page, rather than something to handle
 */
export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const node = root.querySelector<T>(selector)
  if (!node) throw new Error(`element not found: ${selector}`)
  return node
}

export const el = <K extends keyof HTMLElementTagNameMap>(tag: K, props?: Partial<HTMLElementTagNameMap[K]>): HTMLElementTagNameMap[K] =>
  Object.assign(document.createElement(tag), props)
