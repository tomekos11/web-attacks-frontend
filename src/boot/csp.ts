import { defineBoot } from '@quasar/app-vite/wrappers'
import crypto from 'crypto'
import { useSecurityOptions } from 'src/composables/useSecurityOptions'

export default defineBoot(async ({ ssrContext }) => {
  const { init, clickacjingSecurityEnabled, xssSecurityEnabled } = useSecurityOptions()

  await init()

  const nonce = crypto.randomBytes(16).toString('base64')

  if (ssrContext) {
    ssrContext.nonce = nonce
  }

  ssrContext?.res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      `connect-src 'self' http://localhost:5000 ws://localhost:5000 http://backend.wa.local ws://backend.wa.local ws://localhost:24678 ${xssSecurityEnabled ? '' : '*'};` +
      "img-src 'self' cdn.quasar.dev; " +
      `script-src 'self' ${xssSecurityEnabled ? "'nonce-${ssrContext.nonce}'" : "'unsafe-inline'"}; ` +
      `style-src 'self' 'unsafe-inline'; ` +
      "font-src 'self' data: ;" +
      `frame-ancestors ${clickacjingSecurityEnabled ? "'self'" : '*'}`,
  )
})
