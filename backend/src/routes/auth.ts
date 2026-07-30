import { Router, Request, Response } from 'express'

const router = Router()

const DEMO_USER = { id: 'demo-001', email: 'admin@clausechain.app', name: 'Demo User', role: 'compliance-officer' }
let sessionToken: string | null = null

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'admin@clausechain.app' && password === 'demo') {
    sessionToken = 'demo-token-' + Date.now()
    res.json({ token: sessionToken, user: DEMO_USER })
    return
  }
  res.status(401).json({ error: 'Invalid credentials' })
})

router.post('/logout', (_req: Request, res: Response) => {
  sessionToken = null
  res.json({ ok: true })
})

router.get('/me', (req: Request, res: Response) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== sessionToken) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  res.json({ user: DEMO_USER })
})

export default router
