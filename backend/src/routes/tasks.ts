import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { writeAudit } from '../lib/audit'

const router = Router()

const TASK_STATUSES = ['todo', 'in-progress', 'in-review', 'done'] as const
type TaskStatus = (typeof TASK_STATUSES)[number]

router.get('/', async (req: Request, res: Response) => {
  const where: Record<string, unknown> = {}
  if (req.query.status) where.status = req.query.status
  if (req.query.ruleObjectId) where.ruleObjectId = req.query.ruleObjectId

  const tasks = await prisma.complianceTask.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      ruleObject: { select: { obligation: true, deadlineRule: true } },
      evidence: { select: { id: true, filename: true, createdAt: true } },
    },
  })
  res.json(tasks)
})

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const task = await prisma.complianceTask.findUnique({
    where: { id },
    include: {
      ruleObject: { select: { obligation: true, deadlineRule: true, evidenceRequired: true } },
      evidence: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return
  }
  res.json(task)
})

router.patch('/:id/move', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { status } = req.body
  if (!(TASK_STATUSES as readonly string[]).includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${TASK_STATUSES.join(', ')}` })
    return
  }

  const existing = await prisma.complianceTask.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Task not found' })
    return
  }

  const task = await prisma.complianceTask.update({
    where: { id },
    data: { status },
  })

  await writeAudit('task', id, `moved_to_${status}`, 'demo-user')

  res.json(task)
})

export default router
