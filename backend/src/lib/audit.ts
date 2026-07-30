import crypto from 'crypto'
import { prisma } from './prisma'

export async function writeAudit(
  entityType: string,
  entityId: string,
  action: string,
  actor: string,
  details?: string
): Promise<void> {
  const lastEntry = await prisma.auditEntry.findFirst({ orderBy: { createdAt: 'desc' } })
  const prevHash = lastEntry?.entryHash || null

  const payload = JSON.stringify({ entityType, entityId, action, actor, details, prevHash })
  const entryHash = crypto.createHash('sha256').update(payload + Date.now()).digest('hex')

  await prisma.auditEntry.create({
    data: { entityType, entityId, action, actor, actorType: 'user', details, prevHash, entryHash },
  })
}
