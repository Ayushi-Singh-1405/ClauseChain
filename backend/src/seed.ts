import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { initPrisma, prisma } from './lib/prisma'
import { segmentClauses } from './agents/segmentation'

const DATA_DIR = path.resolve(__dirname, '../../data')

const SEED_FILES = [
  { filename: 'cscrf-excerpt_2.md', title: 'CSCRF Excerpt — VAPT & Incident Reporting', source: 'cscrf-excerpt_2.md', ref: 'SEBI/HO/ITD-1/ITD_CSC_EXT/P/CIR/2024/113' },
]

async function seed() {
  await initPrisma()
  console.log('Seeding data...')

  for (const file of SEED_FILES) {
    const filePath = path.join(DATA_DIR, file.filename)
    if (!fs.existsSync(filePath)) {
      console.warn(`  Skip — not found: ${filePath}`)
      continue
    }

    const rawText = fs.readFileSync(filePath, 'utf-8')
    const contentHash = crypto.createHash('sha256').update(rawText).digest('hex')

    const existing = await prisma.circular.findUnique({ where: { contentHash } })
    if (existing) {
      console.log(`  Already seeded: ${file.filename} (${existing.id})`)
      continue
    }

    const circular = await prisma.circular.create({
      data: { title: file.title, source: file.source, ref: file.ref, rawText, contentHash },
    })

    const clauses = segmentClauses(rawText)
    if (clauses.length > 0) {
      await prisma.clause.createMany({
        data: clauses.map((c) => ({
          circularId: circular.id,
          citationId: c.citationId,
          rawText: c.rawText,
        })),
      })
      await prisma.circular.update({
        where: { id: circular.id },
        data: { status: 'segmented' },
      })
    }

    console.log(`  Seeded: ${file.filename} → ${circular.id} (${clauses.length} clauses)`)
  }

  console.log('Seed complete.')
  await prisma.$disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
