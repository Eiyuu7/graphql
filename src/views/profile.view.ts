import { renderBarChart } from '../charts/barChart'
import { renderLineChart } from '../charts/lineChart'
import { $, el } from '../dom'
import {
  cumulativeXpOverTime,
  formatXp,
  getProfile,
  getXpTransactions,
  groupXpByProject,
  remainderToNextMB,
} from '../services/profile.service'
import type { BarDatum, LinePoint } from '../types'

export function renderInfoCard(container: HTMLElement, label: string, value: string, sub?: string): HTMLElement {
  const card = el('div', { className: 'card' })
  card.append(el('p', { className: 'card__label', textContent: label }), el('p', { className: 'card__value', textContent: value }))
  if (sub) card.append(el('p', { className: 'card__sub', textContent: sub }))
  container.append(card)
  return card
}

function setStatus(container: HTMLElement, text: string, isError = false): void {
  container.innerHTML = ''
  container.append(
    el('p', {
      className: isError ? 'status status--error' : 'status',
      textContent: text,
    }),
  )
}

// charts are sized from their container's pixel width, so they have to be
// redrawn whenever that width changes
let lastCharts: { byProject: BarDatum[]; overTime: LinePoint[] } | null = null
let resizeTimer: number | undefined

function drawCharts(byProject: BarDatum[], overTime: LinePoint[]): void {
  lastCharts = { byProject, overTime }
  renderBarChart($('#xp-by-project .chart__canvas'), byProject)
  renderLineChart($('#xp-over-time .chart__canvas'), overTime)
}

addEventListener('resize', () => {
  if (!lastCharts) return
  clearTimeout(resizeTimer)
  const { byProject, overTime } = lastCharts
  resizeTimer = setTimeout(() => drawCharts(byProject, overTime), 150)
})

export async function renderProfile(): Promise<void> {
  const sections = $('#sections')
  setStatus(sections, 'loading profile…')

  try {
    // the two queries do not depend on each other, so the page waits for the
    // slower one rather than for their sum
    const [{ user, moduleXp }, xpTransactions] = await Promise.all([getProfile(), getXpTransactions()])

    $('#whoami').textContent = user.login
    sections.innerHTML = ''

    renderInfoCard(sections, 'identity', user.login)

    const xpCard = renderInfoCard(sections, 'module xp', formatXp(moduleXp), remainderToNextMB(moduleXp))
    $('.card__value', xpCard).classList.add('card__value--accent')

    const ratio = user.auditRatio ?? null
    const ratioCard = renderInfoCard(sections, 'audit ratio', ratio != null ? ratio.toFixed(2) : 'n/a')
    if (ratio != null) {
      $('.card__value', ratioCard).style.color = ratio >= 1 ? 'var(--green)' : 'var(--red)'
    }

    renderInfoCard(sections, 'xp given', formatXp(user.totalUp), 'audits you ran')
    renderInfoCard(sections, 'xp received', formatXp(user.totalDown), 'audits run on you')

    drawCharts(groupXpByProject(xpTransactions), cumulativeXpOverTime(xpTransactions))
  } catch (err) {
    setStatus(sections, `could not load profile data: ${err instanceof Error ? err.message : String(err)}`, true)
  }
}
