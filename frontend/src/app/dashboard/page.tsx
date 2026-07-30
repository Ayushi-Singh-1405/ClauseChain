'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardMetrics {
  totalCirculars: number
  pendingRules: number
  approvedRules: number
  totalTasks: number
  openTasks: number
  overdueTasks: number
  atRiskTasks: number
  complianceScore: number
  recentActivity: { id: string; entityType: string; action: string; actor: string; createdAt: string }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<DashboardMetrics>('/api/dashboard/metrics').then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    )
  }

  if (!data) return <p className="text-muted-foreground">Failed to load dashboard.</p>

  const cards = [
    { title: 'Circulars', value: data.totalCirculars, desc: 'Total ingested' },
    { title: 'Pending Rules', value: data.pendingRules, desc: 'Awaiting review' },
    { title: 'Approved Rules', value: data.approvedRules, desc: 'In register' },
    { title: 'Open Tasks', value: data.openTasks, desc: `${data.totalTasks} total` },
    { title: 'Overdue', value: data.overdueTasks, desc: 'Past due date', accent: data.overdueTasks > 0 },
    { title: 'At Risk', value: data.atRiskTasks, desc: 'Due in 7 days', accent: data.atRiskTasks > 0 },
    { title: 'Compliance Score', value: `${data.complianceScore}%`, desc: 'Tasks completed', large: true },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title} className={c.accent ? 'border-amber-400' : ''}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{c.title}</CardTitle></CardHeader>
            <CardContent>
              <p className={`${c.large ? 'text-3xl' : 'text-2xl'} font-bold`}>{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {data.recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-md border p-2 text-sm">
                  <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                  <span className="font-medium">{a.actor}</span>
                  <span>{a.action}</span>
                  <span className="text-muted-foreground">{a.entityType}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
