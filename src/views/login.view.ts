import { login, logout } from '../auth/auth.service'
import { $ } from '../dom'
import { enterProfile, showView } from '../router'

export function bindLoginForm(): void {
  $<HTMLFormElement>('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault()

    const errorEl = $('#login-error')
    const submitBtn = $<HTMLButtonElement>('#login-submit')
    const identifier = $<HTMLInputElement>('#identifier').value.trim()
    const password = $<HTMLInputElement>('#password').value

    errorEl.textContent = ''
    if (!identifier || !password) {
      errorEl.textContent = 'enter a username or email and a password.'
      return
    }

    submitBtn.disabled = true
    submitBtn.textContent = 'connecting…'

    try {
      await login(identifier, password)
      enterProfile()
    } catch (err) {
      errorEl.textContent = err instanceof Error ? err.message : String(err)
    } finally {
      // a failed attempt has to leave a usable form behind
      submitBtn.disabled = false
      submitBtn.textContent = 'log in'
    }
  })
}

export function bindLogoutButton(): void {
  $<HTMLButtonElement>('#logout-btn').addEventListener('click', () => {
    logout()
    // the markup is static, so the field keeps its value across a view switch
    $<HTMLInputElement>('#password').value = ''
    showView('login')
  })
}
