import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 50
  const skip = (page - 1) * limit

  const [entries, total] = await Promise.all([
    prisma.auditEntry.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditEntry.count(),
  ])

  res.json({ entries, total, page, limit })
})

export default router
