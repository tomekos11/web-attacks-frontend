import { type Request, type Response } from 'express'
import { defineSsrMiddleware } from '#q-app/wrappers'
import express from 'express'
import { useSecurityOptions } from 'src/composables/useSecurityOptions'

export default defineSsrMiddleware(({ app }) => {
  const { setClickacjingSecurityEnabled, setXssSecurityEnabled } = useSecurityOptions()

  app.use(express.json())

  app.post('/api/set-clickjacking', async (req: Request, res: Response) => {
    const { isActive } = req.body

    setClickacjingSecurityEnabled(isActive)

    res.status(200).json({ message: 'clickjacking security updated', isActive })
  })

  app.post('/api/set-xss', async (req: Request, res: Response) => {
    const { isActive } = req.body

    setXssSecurityEnabled(isActive)

    res.status(200).json({ message: 'XSS security updated', isActive })
  })
})
