import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  const now = new Date()

  const tasks = await prisma.complianceTask.findMany({
    where: { status: { not: 'done' } },
    select: { id: true, title: true, dueDate: true, status: true, ruleObjectId: true },
  })

  const gaps = tasks.map((t) => {
    const diffDays = Math.round((t.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    let severity: string
    if (diffDays < 0) {
      severity = 'Overdue'
    } else if (diffDays <= 7) {
      severity = 'At-Risk'
    } else {
      severity = 'On-Track'
    }
    return { taskId: t.id, title: t.title, dueDate: t.dueDate, status: t.status, daysRemaining: diffDays, severity }
  })

  res.json({
    totalGaps: gaps.filter((g) => g.severity !== 'On-Track').length,
    overdue: gaps.filter((g) => g.severity === 'Overdue').length,
    atRisk: gaps.filter((g) => g.severity === 'At-Risk').length,
    gaps,
  })
})

export default router
