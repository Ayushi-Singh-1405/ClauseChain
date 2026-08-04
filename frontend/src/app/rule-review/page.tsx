'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface PendingRule {
  id: string
  obligation: string
  actorRole: string
  taxonomy: string
  frequency: string
  triggerCondition: string | null
  deadlineRule: string
  deadlineDays: number | null
  evidenceRequired: string[]
  penalty: string | null
  confidence: number | null
  status: string
  createdAt: string
  circular: { title: string; ref: string | null }
  clause: { citationId: string; rawText: string } | null
}

export default function RuleReviewPage() {
  const [rules, setRules] = useState<PendingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    api.get<PendingRule[]>('/api/rules/pending')
      .then(setRules)
      .catch(() => setError('Failed to load pending rules. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  async function handleApprove(id: string) {
    if (pendingId) return
    setPendingId(id)
    setError(null)
    try {
      await api.post(`/api/rules/${id}/approve`, { approvedBy: 'demo-user' })
      setRules((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      setError(`Failed to approve rule: ${(e as Error).message}`)
    } finally {
      setPendingId(null)
    }
  }

  async function handleReject(id: string) {
    if (pendingId) return
    const reason = prompt('Rejection reason:')
    if (reason === null) return
    setPendingId(id)
    setError(null)
    try {
      await api.post(`/api/rules/${id}/reject`, { rejectionReason: reason || 'Rejected by reviewer' })
      setRules((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      setError(`Failed to reject rule: ${(e as Error).message}`)
    } finally {
      setPendingId(null)
    }
  }

  const confidenceColor = (c: number | null) => {
    if (c === null) return 'outline' as const
    if (c >= 0.8) return 'default' as const
    if (c >= 0.5) return 'secondary' as const
    return 'destructive' as const
  }

  const freqBadge = (f: string) => {
    const map: Record<string, string> = {
      ANNUAL: 'bg-blue-100 text-blue-800',
      EVENT_DRIVEN: 'bg-amber-100 text-amber-800',
      CONTINUOUS: 'bg-green-100 text-green-800',
      ONE_TIME: 'bg-gray-100 text-gray-800',
    }
    return map[f] || 'bg-gray-100'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rule Review</h1>
      <p className="text-muted-foreground">Review extracted obligations. Approve to add them to the Compliance Register, or reject with a reason.</p>

      {error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No pending rules. Extract obligations from a circular first.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{rule.obligation}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant={confidenceColor(rule.confidence)}>
                        {rule.confidence !== null ? `${Math.round(rule.confidence * 100)}%` : 'No confidence'}
                      </Badge>
                      <Badge className={freqBadge(rule.frequency)}>{rule.frequency}</Badge>
                      {rule.triggerCondition && <Badge variant="outline">{rule.triggerCondition}</Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Actor:</span> {rule.actorRole}</div>
                  {rule.deadlineRule && <div><span className="font-medium">Deadline:</span> {rule.deadlineRule}</div>}
                  {rule.evidenceRequired.length > 0 && (
                    <div><span className="font-medium">Evidence:</span> {rule.evidenceRequired.join(', ')}</div>
                  )}
                  {rule.penalty && <div><span className="font-medium">Penalty:</span> {rule.penalty}</div>}
                  {rule.clause && (
                    <div className="text-muted-foreground text-xs mt-2">
                      <span className="font-medium">Source:</span> {rule.circular.ref || rule.circular.title} &mdash; {rule.clause.citationId}
                    </div>
                  )}
                  <div className="flex gap-2 pt-3">
                    <Button size="sm" disabled={pendingId !== null} onClick={() => handleApprove(rule.id)}>
                      {pendingId === rule.id ? 'Approving…' : 'Approve'}
                    </Button>
                    <Button size="sm" variant="destructive" disabled={pendingId !== null} onClick={() => handleReject(rule.id)}>
                      {pendingId === rule.id ? 'Rejecting…' : 'Reject'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
