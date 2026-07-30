import { prisma } from '../lib/prisma'

export async function generateTasks(ruleObjectId: string): Promise<number> {
  const rule = await prisma.complianceRuleObject.findUnique({
    where: { id: ruleObjectId },
  })
  if (!rule) throw new Error(`Rule ${ruleObjectId} not found`)

  const title = `Comply: ${rule.obligation.substring(0, 80)}...`
  const dueDate = new Date()
  if (rule.deadlineDays !== null && rule.deadlineDays > 0) {
    dueDate.setDate(dueDate.getDate() + rule.deadlineDays)
  } else if (rule.deadlineDays === 0) {
    dueDate.setHours(dueDate.getHours() + 6)
  } else {
    dueDate.setDate(dueDate.getDate() + 30)
  }

  await prisma.complianceTask.create({
    data: {
      ruleObjectId: rule.id,
      title,
      owner: rule.actorRole,
      dueDate,
      frequency: rule.frequency,
      status: 'todo',
    },
  })

  return 1
}
