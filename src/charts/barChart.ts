import { formatXp } from '../services/profile.service'
import type { BarDatum } from '../types'
import { chartSvg, colors, emptyChartNote, escapeHtml, svgEl, svgText } from './svg'
import { bindTooltip } from './tooltip'

const BAR_LIMIT = 12

/**
 * xp by project
 *
 * the dimensions of the table are different based on whether its xp by project or xp over time
 * if the same format is used fo both, it fucks up with the overall readability of the project names
 */
export function renderBarChart(container: HTMLElement, data: BarDatum[]): void {
  container.innerHTML = ''
  const top = data.slice(0, BAR_LIMIT)
  if (!top.length) return container.append(emptyChartNote())

  const c = colors()
  const rowH = 26
  const padY = 10
  const barH = 12
  const width = container.clientWidth || 420
  const height = padY * 2 + top.length * rowH
  const labelW = Math.min(150, Math.max(84, Math.round(width * 0.34)))
  const trackX = labelW + 10
  const trackW = Math.max(40, width - trackX - 68)
  const max = Math.max(...top.map((d) => d.value), 1)
  const maxChars = Math.max(6, Math.floor(labelW / 6.4))

  const svg = chartSvg(width, height)

  top.forEach((d, i) => {
    const y = padY + i * rowH
    const mid = y + rowH / 2
    const barBox = { y: mid - barH / 2, height: barH, rx: 1 }

    svg.append(svgEl('rect', { x: trackX, width: trackW, fill: c.border, opacity: 0.55, ...barBox }))

    const bar = svgEl('rect', {
      x: trackX,
      width: Math.max(1, (d.value / max) * trackW),
      fill: c.amber,
      ...barBox,
    })

    // full-width transparent row, so the whole line is hoverable
    const hit = svgEl('rect', { x: 0, y, width, height: rowH, fill: 'transparent', class: 'chart-hit' })
    bindTooltip(
      hit,
      `<div class="tt-title">${escapeHtml(d.label)}</div>` + `<div class="tt-sub">${d.value.toLocaleString()} xp · ${formatXp(d.value)}</div>`,
      () => bar.setAttribute('opacity', '0.75'),
      () => bar.removeAttribute('opacity'),
    )

    svg.append(
      bar,
      svgText(
        { x: labelW, y: mid + 3.5, 'text-anchor': 'end', fill: c.dim },
        d.label.length > maxChars ? d.label.slice(0, maxChars - 1) + '…' : d.label,
      ),
      svgText({ x: width - 4, y: mid + 3.5, 'text-anchor': 'end', fill: c.text }, formatXp(d.value)),
      hit,
    )
  })

  container.append(svg)
}
