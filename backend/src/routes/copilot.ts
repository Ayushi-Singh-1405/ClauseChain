import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { callLLM } from '../lib/openrouter'

const router = Router()

router.post('/query', async (req: Request, res: Response) => {
  const { question } = req.body
  if (!question) {
    res.status(400).json({ error: 'question is required' })
    return
  }

  const rules = await prisma.complianceRuleObject.findMany({
    where: { status: 'approved' },
    include: {
      circular: { select: { title: true, ref: true } },
      tasks: { select: { title: true, status: true, dueDate: true } },
    },
  })

  const context = rules.map((r) => {
    const tasks = r.tasks.map((t) => `- ${t.title} (${t.status}, due ${t.dueDate.toISOString().split('T')[0]})`).join('\n')
    return `CRO ${r.id.slice(0, 8)}:
  Obligation: ${r.obligation}
  Actor: ${r.actorRole}
  Frequency: ${r.frequency}
  Deadline: ${r.deadlineRule || 'N/A'} (${r.deadlineDays || '?'} days)
  Evidence: ${r.evidenceRequired.join(', ')}
  Circular: ${r.circular.title} (${r.circular.ref || 'no ref'})
  Tasks:\n${tasks || '  (none)'}`
  }).join('\n\n')

  const prompt = `You are a compliance copilot for SEBI CSCRF regulations. Answer the question using ONLY the approved Compliance Rule Objects below. If the answer is not in the context, say "I don't have enough information to answer that."

Context (approved CROs):
${context || '(no approved CROs yet)'}

Question: ${question}

Answer concisely. Cite the relevant CRO ID(s) in brackets like [CRO_abcd1234].`

  try {
    const answer = await callLLM(prompt)
    res.json({ answer, rulesCount: rules.length })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

export default router
