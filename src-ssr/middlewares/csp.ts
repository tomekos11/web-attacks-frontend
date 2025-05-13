import { type Request, type Response } from 'express'
import { defineSsrMiddleware } from '#q-app/wrappers'
import express from 'express'

export let clickacjingSecurityEnabled = true
export let xssSecurityEnabled = true

export default defineSsrMiddleware(({ app }) => {
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
