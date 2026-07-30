import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initPrisma } from './lib/prisma'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

import circularRoutes from './routes/circulars'
import ruleRoutes from './routes/rules'
import taskRoutes from './routes/tasks'
import evidenceRoutes from './routes/evidence'
import auditRoutes from './routes/audit'
import dashboardRoutes from './routes/dashboard'
import gapRoutes from './routes/gaps'
import copilotRoutes from './routes/copilot'
import authRoutes from './routes/auth'
import settingsRoutes from './routes/settings'

app.use('/api/circulars', circularRoutes)
app.use('/api/rules', ruleRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/evidence', evidenceRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/gaps', gapRoutes)
app.use('/api/copilot', copilotRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/settings', settingsRoutes)

initPrisma().then(() => {
  app.listen(PORT, () => {
    console.log(`ClauseChain backend running on port ${PORT}`)
  })
})
