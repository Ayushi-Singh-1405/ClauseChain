import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { writeAudit } from '../lib/audit'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  const evidence = await prisma.evidence.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      task: {
        select: { title: true, ruleObjectId: true },
      },
    },
  })
  res.json(evidence)
})

router.post('/upload', async (req: Request, res: Response) => {
  const { taskId, filename, fileData } = req.body
  if (!filename) {
    res.status(400).json({ error: 'filename is required' })
    return
  }

  const fileContent = fileData || ''

  if (taskId) {
    const task = await prisma.complianceTask.findUnique({ where: { id: taskId } })
    if (!task) {
      res.status(400).json({ error: 'Task not found' })
      return
    }
    await prisma.complianceTask.update({
      where: { id: taskId },
      data: { status: 'in-review' },
    })
  }

  const contentHash = crypto.createHash('sha256').update(fileContent).digest('hex')

  const evidence = await prisma.evidence.create({
    data: {
      taskId: taskId || null,
      filename,
      fileData: fileContent,
      fileSize: String(fileContent.length),
      contentHash,
      uploadedBy: 'demo-user',
    },
  })

  await writeAudit('evidence', evidence.id, 'uploaded', 'demo-user', `uploaded file: ${filename}`)

  res.status(201).json(evidence)
})

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const evidence = await prisma.evidence.findUnique({
    where: { id },
    include: {
      task: {
        select: { title: true, status: true },
      },
    },
  })
  if (!evidence) {
    res.status(404).json({ error: 'Evidence not found' })
    return
  }
  res.json(evidence)
})

export default router
