import { el } from '../dom'
import type { Palette } from '../types'

export const SVG_NS = 'http://www.w3.org/2000/svg'

export type SvgAttrs = Record<string, string | number>

export function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: SvgAttrs = {}): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag) as SVGElementTagNameMap[K]
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value))
  return node
}

export function svgText(attrs: SvgAttrs, content: string): SVGTextElement {
  const node = svgEl('text', { 'font-size': 10.5, ...attrs })
  node.textContent = content
  return node
}

export const chartSvg = (width: number, height: number): SVGSVGElement =>
  svgEl('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height })

export const emptyChartNote = (): HTMLParagraphElement =>
  el('p', { className: 'chart__empty', textContent: 'not enough data yet' })

/**
 * SVG presentation attributes do not reliably accept var(), so the palette is
 * read off :root once and passed around as plain colour strings. The theme
 * still lives in CSS; the charts just resolve it at first render.
 */
let palette: Palette | null = null

export function colors(): Palette {
  if (!palette) {
    const css = getComputedStyle(document.documentElement)
    const read = (name: string, fallback: string): string => css.getPropertyValue(name).trim() || fallback
    palette = {
      amber: read('--amber', '#ffb000'),
      green: read('--green', '#5fbd7c'),
      text: read('--text', '#e8e1d3'),
      dim: read('--text-dim', '#9a9186'),
      faint: read('--text-faint', '#665e51'),
      border: read('--border', '#2b2620'),
    }
  }
  return palette
}

/** Tooltip bodies are built as HTML, and project names come from the API. */
export const escapeHtml = (str: string): string =>
  String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] as string,
  )
