import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { generateTasks } from '../agents/workflow'
import { writeAudit } from '../lib/audit'

const router = Router()

function bodyAsString(val: unknown): string | undefined {
  if (Array.isArray(val)) return val[0]
  if (typeof val === 'string') return val
  return undefined
}

router.get('/pending', async (_req: Request, res: Response) => {
  const rules = await prisma.complianceRuleObject.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
    include: {
      circular: { select: { title: true, ref: true } },
      clause: { select: { citationId: true, rawText: true } },
    },
  })
  res.json(rules)
})

router.get('/approved', async (_req: Request, res: Response) => {
  const rules = await prisma.complianceRuleObject.findMany({
    where: { status: 'approved' },
    orderBy: { updatedAt: 'desc' },
    include: {
      circular: { select: { title: true, ref: true } },
      tasks: true,
    },
  })
  res.json(rules)
})

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const rule = await prisma.complianceRuleObject.findUnique({
    where: { id },
    include: {
      circular: { select: { title: true, ref: true } },
      clause: { select: { citationId: true, rawText: true } },
      tasks: { include: { evidence: true } },
    },
  })
  if (!rule) {
    res.status(404).json({ error: 'Rule not found' })
    return
  }
  res.json(rule)
})

router.post('/:id/approve', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const approvedBy = bodyAsString(req.body.approvedBy) || 'demo-user'
  const rule = await prisma.complianceRuleObject.update({
    where: { id },
    data: { status: 'approved', approvedBy },
  })

  await generateTasks(id)
  await writeAudit('rule', id, 'approved', approvedBy)

  res.json(rule)
})

router.post('/:id/reject', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const rejectionReason = bodyAsString(req.body.rejectionReason) || 'Rejected by reviewer'
  const rule = await prisma.complianceRuleObject.update({
    where: { id },
    data: { status: 'rejected', rejectionReason },
  })

  await writeAudit('rule', id, 'rejected', 'demo-user', rejectionReason)

  res.json(rule)
})

router.post('/:id/edit', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const patch: Record<string, unknown> = {}
  const fields = ['obligation', 'actorRole', 'taxonomy', 'frequency', 'triggerCondition', 'deadlineRule', 'penalty']
  for (const f of fields) {
    const val = bodyAsString((req.body as any)[f])
    if (val !== undefined) patch[f] = val
  }
  if (req.body.deadlineDays !== undefined) patch.deadlineDays = Number(req.body.deadlineDays)
  if (req.body.evidenceRequired !== undefined) patch.evidenceRequired = req.body.evidenceRequired

  const rule = await prisma.complianceRuleObject.update({
    where: { id },
    data: { ...patch, version: { increment: 1 } },
  })
  res.json(rule)
})

export default router
