import { type Request, type Response } from 'express'
import { defineSsrMiddleware } from '#q-app/wrappers'
import express from 'express'

let clickacjingSecurityEnabled = true
let xssSecurityEnabled = true

export default defineSsrMiddleware(({ app, resolve, render, serve }) => {
  app.use((req: Request, res: Response, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "connect-src 'self' http://localhost:5000 ws://localhost:5000 ws://localhost:24678; " +
        "img-src 'self' cdn.quasar.dev; " +
        `script-src 'self' ${xssSecurityEnabled ? '' : 'unsafe-inline'}; ` +
        "style-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data: ;" +
        `frame-ancestors ${clickacjingSecurityEnabled ? "'self'" : '*'}`,
    )
    next()
  })

  app.use(express.json())

  app.post('/api/set-clickjacking', async (req: Request, res: Response) => {
    const { isActive } = req.body

    clickacjingSecurityEnabled = isActive

    res.status(200).json({ message: 'clickjacking security updated', isActive })
  })

  app.post('/api/set-xss', async (req: Request, res: Response) => {
    const { isActive } = req.body

    xssSecurityEnabled = isActive

    res.status(200).json({ message: 'XSS security updated', isActive })
  })
})
