'use client'

import { Fragment, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Task {
  id: string
  title: string
  status: string
  dueDate: string
  owner: string
}

interface ApprovedRule {
  id: string
  obligation: string
  actorRole: string
  taxonomy: string
  frequency: string
  triggerCondition: string | null
  deadlineRule: string | null
  deadlineDays: number | null
  evidenceRequired: string[]
  penalty: string | null
  version: number
  approvedBy: string | null
  createdAt: string
  circular: { title: string; ref: string | null }
  tasks: Task[]
}

export default function RegisterPage() {
  const [rules, setRules] = useState<ApprovedRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    api.get<ApprovedRule[]>('/api/rules/approved')
      .then(setRules)
      .catch(() => setError('Failed to load the compliance register. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Compliance Register</h1>
      <p className="text-muted-foreground">Approved compliance rule objects and their generated tasks.</p>

      {error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {loading ? (
        <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
      ) : rules.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No approved rules yet.</CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Approved Rules ({rules.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Obligation</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Circular</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((r) => (
                  <Fragment key={r.id}>
                    <TableRow className="cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                      <TableCell className="font-medium">{r.obligation}</TableCell>
                      <TableCell><Badge variant="secondary">{r.frequency}</Badge></TableCell>
                      <TableCell>{r.actorRole}</TableCell>
                      <TableCell className="text-right">{r.tasks.length}</TableCell>
                      <TableCell>v{r.version}</TableCell>
                      <TableCell>{r.approvedBy || '—'}</TableCell>
                      <TableCell>{r.circular.ref || r.circular.title}</TableCell>
                    </TableRow>
                    {expanded === r.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          {r.tasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tasks generated.</p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Tasks</p>
                              {r.tasks.map((t) => (
                                <div key={t.id} className="flex items-center gap-3 rounded-md border bg-background p-2 text-sm">
                                  <Badge variant={t.status === 'done' ? 'default' : t.status === 'in-progress' ? 'secondary' : 'outline'}>{t.status}</Badge>
                                  <span>{t.title}</span>
                                  <span className="ml-auto text-muted-foreground">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</span>
                                  <span className="text-muted-foreground">{t.owner || 'Unassigned'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
