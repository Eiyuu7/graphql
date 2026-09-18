/**
 * entry point of program obviosuly.  it runs after the DOM is parsed
 *
 * layering: dom/config -> auth -> api -> services -> charts -> views -> router.
 */
import { $ } from './dom'
import { startMatrixRain, startMouseTrail } from './effects/background'
import { boot } from './router'
import { bindLoginForm, bindLogoutButton } from './views/login.view'

// handlers first, so a submit landing during boot is never dropped
bindLoginForm()
bindLogoutButton()

boot()
console.log(boot)

startMatrixRain($<HTMLCanvasElement>('#rain'))
startMouseTrail($<HTMLCanvasElement>('#trail'))
