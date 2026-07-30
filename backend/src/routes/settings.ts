import { Router, Request, Response } from 'express'

const router = Router()

let settings: Record<string, string> = {
  appName: 'ClauseChain',
  complianceFramework: 'SEBI CSCRF',
  organization: 'Demo Corp',
  demoMode: 'true',
}

router.get('/', (_req: Request, res: Response) => {
  res.json(settings)
})

router.patch('/', (req: Request, res: Response) => {
  const allowed = ['appName', 'complianceFramework', 'organization', 'demoMode']
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      settings[key] = String(req.body[key])
    }
  }
  res.json(settings)
})

export default router
