/**
 * purely decorative canvas. speaking of which, i think this is the one and only time we're
 * technically "allowed" to use canvas in a project? maybe not... does anyone ever read any of these comments?
 *
 *! note to self: i realised i could use the navigator (node_modules/typescript/lib/lib.dom.d.ts) for this purpose
 *! instead of writing down the code for cmatrix.
 */

console.log(navigator)
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

/** because it uses innerWidth/Height, its more dynamic upon resizing. which i guess makes it a bit dynamic */
function fitCanvas(canvas: HTMLCanvasElement, onResize?: () => void): CanvasRenderingContext2D {
  const resize = (): void => {
    canvas.width = innerWidth
    canvas.height = innerHeight
    if (onResize) onResize()
  }
  resize()
  addEventListener('resize', resize)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d canvas context unavailable')
  return ctx
}

function animate(draw: () => void): void {
  if (reduceMotion)
    return draw() // single static frame instead of an endless loop
  ;(function loop() {
    draw()
    requestAnimationFrame(loop)
  })()
}

/** continuous digital rain, cmatrix style*/
export function startMatrixRain(canvas: HTMLCanvasElement): void {
  const glyphs = 'アイウエオカキクケコサシスセソ0123456789'
  const fontSize = 15
  let drops: number[] = []

  const ctx = fitCanvas(canvas, () => {
    drops = Array.from({ length: Math.ceil(canvas.width / fontSize) }, () => Math.floor((Math.random() * canvas.height) / fontSize))
  })

  animate(() => {
    ctx.fillStyle = 'rgba(10, 9, 8, 0.08)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${fontSize}px monospace`
    // ctx.fillStyle = 'rgba(0, 255, 102, 0.35)'
    ctx.fillStyle = 'rgba(183, 192, 16, 0.35)'

    drops.forEach((drop, i) => {
      ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fontSize, drop * fontSize)
      const recycled = drop * fontSize > canvas.height && Math.random() > 0.975
      drops[i] = (recycled ? 0 : drop) + 1
    })
  })
}

export function startMouseTrail(canvas: HTMLCanvasElement): void {
  if (reduceMotion) return

  const ctx = fitCanvas(canvas)
  const points: { x: number; y: number; age: number }[] = []

  addEventListener('pointermove', (e) => {
    points.push({ x: e.clientX, y: e.clientY, age: 0 })
    if (points.length > 40) points.shift()
  })

  animate(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i]
      const life = 1 - ++p.age / 30
      if (life <= 0) {
        points.splice(i, 1)
        continue
      }
      ctx.beginPath()
      ctx.arc(p.x, p.y, 6 * life, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 176, 0, ${life * 0.35})`
      ctx.fill()
    }
  })
}
