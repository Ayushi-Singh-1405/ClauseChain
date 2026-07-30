'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface TaskItem {
  id: string
  title: string
  description: string | null
  status: string
  priority: string | null
  dueDate: string
  assignee: string | null
  ruleObjectId: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<TaskItem[]>('/api/tasks').then(setTasks).finally(() => setLoading(false))
  }, [])

  async function moveStatus(taskId: string, newStatus: string) {
    await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus })
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
  }

  const columns = [
    { key: 'todo', label: 'To Do', color: 'bg-gray-100 dark:bg-gray-800/50' },
    { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { key: 'in_review', label: 'In Review', color: 'bg-purple-50 dark:bg-purple-900/20' },
    { key: 'done', label: 'Done', color: 'bg-green-50 dark:bg-green-900/20' },
  ]

  const grouped = columns.reduce<Record<string, TaskItem[]>>(
    (acc, col) => ({ ...acc, [col.key]: tasks.filter((t) => t.status === col.key) }),
    {},
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <p className="text-muted-foreground">Kanban board for compliance tasks. Click buttons to move tasks between statuses.</p>

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
          {columns.map((col) => (
            <div key={col.key} className={`rounded-lg p-3 ${col.color}`}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {col.label} ({grouped[col.key]?.length || 0})
              </h3>
              <div className="space-y-3">
                {(grouped[col.key] || []).map((t) => (
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
                        {col.key !== 'todo' && (
                          <Button size="sm" variant="ghost" onClick={() => {
                            const back = { in_progress: 'todo', in_review: 'in_progress', done: 'in_progress' }[col.key]
                            if (back) moveStatus(t.id, back)
                          }}>← Back</Button>
                        )}
                        {col.key === 'todo' && (
                          <Button size="sm" variant="ghost" onClick={() => moveStatus(t.id, 'in_progress')}>Start →</Button>
                        )}
                        {col.key === 'in_progress' && (
                          <Button size="sm" variant="ghost" onClick={() => moveStatus(t.id, 'in_review')}>Review →</Button>
                        )}
                        {col.key === 'in_review' && (
                          <Button size="sm" variant="ghost" onClick={() => moveStatus(t.id, 'done')}>Complete →</Button>
                        )}
                        {col.key === 'done' && (
                          <Button size="sm" variant="ghost" onClick={() => moveStatus(t.id, 'in_progress')}>Reopen</Button>
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
