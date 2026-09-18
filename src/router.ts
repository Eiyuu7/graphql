import { isAuthenticated } from './auth/auth.service'
import { $ } from './dom'
import type { ViewName } from './types'
import { renderProfile } from './views/profile.view'

/**
 * no history routing so it doesnt show in the URL
 */
export function showView(view: ViewName): void {
  $('#view-login').hidden = view !== 'login'
  $('#view-profile').hidden = view !== 'profile'
}

export function enterProfile(): void {
  showView('profile')
  void renderProfile()
}

export function boot(): void {
  // a failed submit can leave credentials in the query string
  // rewrite the current entry so they are not left in the address bar or
  // one Back press away. replaceState does not push a new history entry

  /**
   *! the pathname is obviously the index.html - and identifier=rihasan&password=hunter2 is the location.search
   * what this does is basically change what the address bar says, without reloading the page 
   */
  if (location.search) history.replaceState(null, '', location.pathname + location.hash)

  // self-explanatory
  if (isAuthenticated()) enterProfile()
  else showView('login')
}
