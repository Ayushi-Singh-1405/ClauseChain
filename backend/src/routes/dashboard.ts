import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/metrics', async (_req: Request, res: Response) => {
  const totalCirculars = await prisma.circular.count()
  const pendingRules = await prisma.complianceRuleObject.count({ where: { status: 'pending' } })
  const approvedRules = await prisma.complianceRuleObject.count({ where: { status: 'approved' } })
  const tasks = await prisma.complianceTask.findMany({
    select: { id: true, status: true, dueDate: true },
  })
  const recentEntries = await prisma.auditEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const now = new Date()
  const overdue = tasks.filter((t) => t.status !== 'done' && t.dueDate < now)
  const atRisk = tasks.filter((t) => {
    if (t.status === 'done') return false
    const diff = (t.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff > 0 && diff <= 7
  })

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const complianceScore = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  res.json({
    totalCirculars,
    pendingRules,
    approvedRules,
    totalTasks,
    openTasks: totalTasks - doneTasks,
    overdueTasks: overdue.length,
    atRiskTasks: atRisk.length,
    complianceScore,
    recentActivity: recentEntries,
  })
})

export default router
