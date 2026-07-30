import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dns from 'dns/promises'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export let prisma!: PrismaClient

export async function initPrisma(): Promise<void> {
  if (globalForPrisma.prisma) {
    prisma = globalForPrisma.prisma
    return
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL not set')

  const url = new URL(connectionString)
  const hostname = url.hostname

  let ip: string
  try {
    const addrs = await dns.resolve4(hostname)
    ip = addrs[0]
  } catch {
    ip = hostname
  }

  const pool = new pg.Pool({
    host: ip,
    port: Number(url.port) || 5432,
    database: url.pathname.replace('/', ''),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false, servername: hostname },
    connectionTimeoutMillis: 10000,
  })

  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
  globalForPrisma.prisma = prisma
}
