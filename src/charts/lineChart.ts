import { formatXp } from '../services/profile.service'
import type { LinePoint } from '../types'
import { chartSvg, colors, emptyChartNote, escapeHtml, svgEl, svgText } from './svg'
import { bindTooltip } from './tooltip'

const LINE_HEIGHT = 240

type DayEntry = LinePoint & { idx: number }

/** cumulative xp over time */
export function renderLineChart(container: HTMLElement, points: LinePoint[]): void {
  container.innerHTML = ''
  if (points.length < 2) return container.append(emptyChartNote())

  const c = colors()
  const width = container.clientWidth || 420
  const height = LINE_HEIGHT
  const [padL, padR, padT, padB] = [54, 14, 30, 28]

  const svg = chartSvg(width, height)
  const maxY = Math.max(...points.map((p) => p.total), 1)
  const minT = points[0].date.getTime()
  const spanT = points[points.length - 1].date.getTime() - minT || 1

  // the old chart spaced points by array index, so the x axis carried no
  // meaning; scaling by real timestamp shows the actual pace of the work
  const scaleX = (date: Date): number => padL + ((date.getTime() - minT) / spanT) * (width - padL - padR)
  const scaleY = (value: number): number => height - padB - (value / maxY) * (height - padT - padB)

  const steps = 4
  for (let i = 0; i <= steps; i++) {
    const value = (maxY / steps) * i
    const y = scaleY(value)
    svg.append(
      svgEl('line', { x1: padL, y1: y, x2: width - padR, y2: y, stroke: c.border, 'stroke-width': 1 }),
      svgText({ x: padL - 8, y: y + 3.5, 'font-size': 9, 'text-anchor': 'end', fill: c.faint }, formatXp(value)),
    )
  }

  const linePts = points.map((p) => `${scaleX(p.date).toFixed(1)},${scaleY(p.total).toFixed(1)}`).join(' ')

  const gradId = 'xp-line-fill'
  const grad = svgEl('linearGradient', { id: gradId, x1: 0, y1: 0, x2: 0, y2: 1 })
  grad.append(
    svgEl('stop', { offset: '0%', 'stop-color': c.green, 'stop-opacity': 0.28 }),
    svgEl('stop', { offset: '100%', 'stop-color': c.green, 'stop-opacity': 0 }),
  )
  const defs = svgEl('defs')
  defs.append(grad)

  svg.append(
    defs,
    svgEl('polygon', {
      points: `${padL},${height - padB} ${linePts} ${width - padR},${height - padB}`,
      fill: `url(#${gradId})`,
    }),
    svgEl('polyline', {
      points: linePts,
      fill: 'none',
      stroke: c.green,
      'stroke-width': 2,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
    }),
  )

  // one marker per calendar day rather than per transaction, so a day with
  // twelve grades does not stack twelve dots on the same pixel
  const byDay = new Map<string, DayEntry[]>()
  points.forEach((p, idx) => {
    const key = p.date.toDateString()
    let entries = byDay.get(key)
    if (!entries) {
      entries = []
      byDay.set(key, entries)
    }
    entries.push({ ...p, idx })
  })

  for (const entries of byDay.values()) {
    const last = entries[entries.length - 1]
    const isLatest = last.idx === points.length - 1
    const [x, y] = [scaleX(last.date), scaleY(last.total)]
    const r = isLatest ? 4.5 : 3
    const opacity = isLatest ? '1' : '0.6'

    const dot = svgEl('circle', { cx: x, cy: y, r, fill: c.green, opacity })
    const day = last.date.toLocaleDateString()
    const many = entries.length > 1

    const hit = svgEl('circle', { cx: x, cy: y, r: 11, fill: 'transparent', class: 'chart-hit' })
    bindTooltip(
      hit,
      `<div class="tt-title">${many ? `${day} · ${entries.length} entries` : escapeHtml(last.label)}</div>` +
        (many
          ? entries.map((e) => `<div class="tt-sub">${escapeHtml(e.label)} · +${e.amount.toLocaleString()} xp</div>`).join('')
          : `<div class="tt-sub">+${last.amount.toLocaleString()} xp · ${day}</div>`) +
        `<div class="tt-sub tt-sub--total">running total ${formatXp(last.total)}</div>`,
      () => {
        dot.setAttribute('r', String(r + 2))
        dot.setAttribute('opacity', '1')
      },
      () => {
        dot.setAttribute('r', String(r))
        dot.setAttribute('opacity', opacity)
      },
    )

    svg.append(dot, hit)
  }

  const axis = { 'font-size': 9, fill: c.faint }
  svg.append(
    svgText({ x: padL, y: height - 8, 'text-anchor': 'start', ...axis }, points[0].date.toLocaleDateString()),
    svgText({ x: width - padR, y: height - 8, 'text-anchor': 'end', ...axis }, points[points.length - 1].date.toLocaleDateString()),
    svgText({ x: width - padR, y: 20, 'font-size': 16, 'text-anchor': 'end', fill: c.text }, formatXp(points[points.length - 1].total)),
  )

  container.append(svg)
}
