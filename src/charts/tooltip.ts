import { el } from '../dom'

/** 
 * okay so, instead of having to create the same element differently, the same tooltip is shared by every chart
 * and it is created on the first hover. given that only one tooltip will be used at a given moment, one has been initialised
 *  
 */
let tooltipEl: HTMLDivElement | null = null

function placeTooltip(evt: MouseEvent): void {
  if (!tooltipEl) return
  const pad = 14
  const { width, height } = tooltipEl.getBoundingClientRect()
  const left = evt.clientX + width + pad * 2 > innerWidth ? evt.clientX - pad - width : evt.clientX + pad
  const top = evt.clientY + height + pad * 2 > innerHeight ? evt.clientY - pad - height : evt.clientY + pad
  tooltipEl.style.left = Math.max(pad, left) + 'px'
  tooltipEl.style.top = Math.max(pad, top) + 'px'
}

/**
 * this attaches hover behaviour to an invisible hit target
 * `onEnter`/`onLeave` lets the caller emphasise the mark the tooltip belongs to
 */
export function bindTooltip(
  hit: SVGElement,
  html: string,
  onEnter: () => void = () => {},
  onLeave: () => void = () => {},
): void {
  hit.addEventListener('mouseenter', (e) => {
    onEnter()
    if (!tooltipEl) tooltipEl = document.body.appendChild(el('div', { className: 'chart-tooltip' }))
    tooltipEl.innerHTML = html
    tooltipEl.classList.add('is-visible')
    placeTooltip(e)
  })
  hit.addEventListener('mousemove', (e) => {
    if (tooltipEl) placeTooltip(e)
  })
  hit.addEventListener('mouseleave', () => {
    onLeave()
    if (tooltipEl) tooltipEl.classList.remove('is-visible')
  })
}
