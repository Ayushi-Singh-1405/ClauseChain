'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TASK_COLUMNS, type TaskStatus } from '@/lib/tasks'

interface TaskItem {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: string | null
  dueDate: string
  assignee: string | null
  ruleObjectId: string
}

const BACK_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
  'in-progress': 'todo',
  'in-review': 'in-progress',
  done: 'in-progress',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<TaskItem[]>('/api/tasks')
      .then(setTasks)
      .catch(() => setError('Failed to load tasks. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  async function moveStatus(taskId: string, newStatus: TaskStatus) {
    if (pendingId) return
    const previous = tasks.find((t) => t.id === taskId)
    if (!previous || previous.status === newStatus) return

    setPendingId(taskId)
    setError(null)
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))

    try {
      await api.patch(`/api/tasks/${taskId}/move`, { status: newStatus })
    } catch (e) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: previous.status } : t)))
      setError(`Failed to move task: ${(e as Error).message}`)
    } finally {
      setPendingId(null)
    }
  }

  const grouped = TASK_COLUMNS.reduce<Record<TaskStatus, TaskItem[]>>(
    (acc, col) => ({ ...acc, [col.status]: tasks.filter((t) => t.status === col.status) }),
    {} as Record<TaskStatus, TaskItem[]>,
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <p className="text-muted-foreground">Kanban board for compliance tasks. Click buttons to move tasks between statuses.</p>

      {error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No tasks yet. Approve rules to generate tasks.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {TASK_COLUMNS.map((col) => (
            <div key={col.status} className={`rounded-lg p-3 ${col.color}`}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {col.label} ({grouped[col.status]?.length || 0})
              </h3>
              <div className="space-y-3">
                {(grouped[col.status] || []).map((t) => (
                  <Card key={t.id}>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{t.title}</p>
                      {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        {t.priority && <Badge variant="outline">{t.priority}</Badge>}
                        <span className="text-muted-foreground">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'}</span>
                        {t.assignee && <span className="ml-auto text-muted-foreground">{t.assignee}</span>}
                      </div>
                      <div className="mt-2 flex gap-1">
                        {col.status !== 'todo' && BACK_STATUS[col.status] && (
                          <Button size="sm" variant="ghost" disabled={pendingId === t.id} onClick={() => moveStatus(t.id, BACK_STATUS[col.status]!)}>← Back</Button>
                        )}
                        {col.status === 'todo' && (
                          <Button size="sm" variant="ghost" disabled={pendingId === t.id} onClick={() => moveStatus(t.id, 'in-progress')}>Start →</Button>
                        )}
                        {col.status === 'in-progress' && (
                          <Button size="sm" variant="ghost" disabled={pendingId === t.id} onClick={() => moveStatus(t.id, 'in-review')}>Review →</Button>
                        )}
                        {col.status === 'in-review' && (
                          <Button size="sm" variant="ghost" disabled={pendingId === t.id} onClick={() => moveStatus(t.id, 'done')}>Complete →</Button>
                        )}
                        {col.status === 'done' && (
                          <Button size="sm" variant="ghost" disabled={pendingId === t.id} onClick={() => moveStatus(t.id, 'in-progress')}>Reopen</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
