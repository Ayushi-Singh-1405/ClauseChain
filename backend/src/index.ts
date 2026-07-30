import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes will be mounted here
// app.use('/api/circulars', circularRoutes)
// app.use('/api/rules', ruleRoutes)
// app.use('/api/tasks', taskRoutes)
// app.use('/api/evidence', evidenceRoutes)
// app.use('/api/audit', auditRoutes)
// app.use('/api/dashboard', dashboardRoutes)
// app.use('/api/copilot', copilotRoutes)
// app.use('/api/auth', authRoutes)
// app.use('/api/settings', settingsRoutes)

app.listen(PORT, () => {
  console.log(`ClauseChain backend running on port ${PORT}`)
})

export default app
