import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { segmentClauses } from '../agents/segmentation'
import { extractCRO } from '../agents/extraction'

const router = Router()

function bodyAsString(val: unknown): string | undefined {
  if (Array.isArray(val)) return val[0]
  if (typeof val === 'string') return val
  return undefined
}

router.get('/', async (_req: Request, res: Response) => {
  const circulars = await prisma.circular.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      source: true,
      ref: true,
      status: true,
      createdAt: true,
      _count: { select: { clauses: true, rules: true } },
    },
  })
  res.json(circulars)
})

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const circular = await prisma.circular.findUnique({
    where: { id },
    include: {
      clauses: { orderBy: { citationId: 'asc' } },
      rules: { orderBy: { createdAt: 'desc' } },
    },
  }) as any
  if (!circular) {
    res.status(404).json({ error: 'Circular not found' })
    return
  }
  res.json(circular)
})

router.post('/ingest', async (req: Request, res: Response) => {
  const title = bodyAsString(req.body.title)
  const rawText = bodyAsString(req.body.rawText)
  const source = bodyAsString(req.body.source) || ''
  const ref = bodyAsString(req.body.ref) || null

  if (!title || !rawText) {
    res.status(400).json({ error: 'title and rawText are required' })
    return
  }

  const contentHash = crypto.createHash('sha256').update(rawText).digest('hex')

  const existing = await prisma.circular.findUnique({ where: { contentHash } })
  if (existing) {
    res.status(409).json({ error: 'Circular already exists', id: existing.id })
    return
  }

  const circular = await prisma.circular.create({
    data: { title, source, ref, rawText, contentHash },
  })

  res.status(201).json(circular)
})

router.post('/:id/segment', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const circular = await prisma.circular.findUnique({ where: { id } })
  if (!circular) {
    res.status(404).json({ error: 'Circular not found' })
    return
  }

  const clauses = segmentClauses(circular.rawText)

  await prisma.clause.createMany({
    data: clauses.map((c) => ({
      circularId: circular.id,
      citationId: c.citationId,
      rawText: c.rawText,
    })),
    skipDuplicates: true,
  })

  await prisma.circular.update({
    where: { id: circular.id },
    data: { status: 'segmented' },
  })

  const saved = await prisma.clause.findMany({
    where: { circularId: circular.id },
    orderBy: { citationId: 'asc' },
  })

  res.json({ circularId: circular.id, clauseCount: saved.length, clauses: saved })
})

router.post('/:id/extract', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const circular = await prisma.circular.findUnique({
    where: { id },
    include: { clauses: { orderBy: { citationId: 'asc' } } },
  }) as any
  if (!circular) {
    res.status(404).json({ error: 'Circular not found' })
    return
  }

  const results: { citationId: string; success: boolean; confidence?: number; error?: string }[] = []

  for (const clause of circular.clauses) {
    try {
      const extraction = await extractCRO(clause.citationId, clause.rawText)
      await prisma.complianceRuleObject.create({
        data: {
          circularId: circular.id,
          clauseId: clause.id,
          obligation: extraction.obligation,
          actorRole: extraction.actorRole,
          taxonomy: extraction.taxonomy,
          frequency: extraction.frequency,
          triggerCondition: extraction.triggerCondition,
          deadlineRule: extraction.deadlineRule,
          deadlineDays: extraction.deadlineDays,
          evidenceRequired: extraction.evidenceRequired,
          penalty: extraction.penalty,
          confidence: extraction.confidence,
          status: 'pending',
          source: { clause: clause.citationId },
        },
      })
      results.push({ citationId: clause.citationId, success: true, confidence: extraction.confidence })
    } catch (err) {
      results.push({ citationId: clause.citationId, success: false, error: (err as Error).message })
    }
  }

  await prisma.circular.update({
    where: { id: circular.id },
    data: { status: 'extracted' },
  })

  res.json({ circularId: circular.id, results })
})

router.post('/:id/process', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const circular = await prisma.circular.findUnique({ where: { id } })
  if (!circular) {
    res.status(404).json({ error: 'Circular not found' })
    return
  }

  const clauses = segmentClauses(circular.rawText)
  await prisma.clause.createMany({
    data: clauses.map((c) => ({
      circularId: circular.id,
      citationId: c.citationId,
      rawText: c.rawText,
    })),
    skipDuplicates: true,
  })

  await prisma.circular.update({
    where: { id: circular.id },
    data: { status: 'segmented' },
  })

  const saved = await prisma.clause.findMany({
    where: { circularId: circular.id },
    orderBy: { citationId: 'asc' },
  })

  const results: { citationId: string; success: boolean; confidence?: number; error?: string }[] = []

  for (const clause of saved) {
    try {
      const extraction = await extractCRO(clause.citationId, clause.rawText)
      await prisma.complianceRuleObject.create({
        data: {
          circularId: circular.id,
          clauseId: clause.id,
          obligation: extraction.obligation,
          actorRole: extraction.actorRole,
          taxonomy: extraction.taxonomy,
          frequency: extraction.frequency,
          triggerCondition: extraction.triggerCondition,
          deadlineRule: extraction.deadlineRule,
          deadlineDays: extraction.deadlineDays,
          evidenceRequired: extraction.evidenceRequired,
          penalty: extraction.penalty,
          confidence: extraction.confidence,
          status: 'pending',
          source: { clause: clause.citationId },
        },
      })
      results.push({ citationId: clause.citationId, success: true, confidence: extraction.confidence })
    } catch (err) {
      results.push({ citationId: clause.citationId, success: false, error: (err as Error).message })
    }
  }

  await prisma.circular.update({
    where: { id: circular.id },
    data: { status: 'extracted' },
  })

  res.json({ circularId: circular.id, clauseCount: saved.length, results })
})

export default router
