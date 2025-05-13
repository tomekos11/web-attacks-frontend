import { defineBoot } from '@quasar/app-vite/wrappers'
import { clickacjingSecurityEnabled, xssSecurityEnabled } from 'app/src-ssr/middlewares/csp'
import crypto from 'crypto'

export default defineBoot(({ ssrContext }) => {
  const nonce = crypto.randomBytes(16).toString('base64')

  if (ssrContext) {
    ssrContext.nonce = nonce
  }

  ssrContext?.res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "connect-src 'self' http://localhost:5000 ws://localhost:5000 ws://localhost:24678; " +
      "img-src 'self' cdn.quasar.dev; " +
      `script-src 'self' 'nonce-${ssrContext.nonce}' ${xssSecurityEnabled ? '' : 'unsafe-inline'}; ` +
      `style-src 'self' 'unsafe-inline'; ` +
      "font-src 'self' data: ;" +
      `frame-ancestors ${clickacjingSecurityEnabled ? "'self'" : '*'}`,
  )
})
