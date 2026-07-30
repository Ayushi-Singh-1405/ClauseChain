'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface AuditEntry {
  id: string
  entityType: string
  entityId: string
  action: string
  actor: string
  actorType: string
  details: string | null
  prevHash: string | null
  entryHash: string
  createdAt: string
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    api.get<{ entries: AuditEntry[]; total: number }>(`/api/audit?page=${page}&limit=${limit}`)
      .then((data) => { setEntries(data.entries); setTotal(data.total) })
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Trail</h1>
      <p className="text-muted-foreground">Chronological log of all actions with hash-chain integrity verification.</p>

      <Card>
        <CardHeader><CardTitle>Audit Log ({total} entries)</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          ) : entries.length === 0 ? (
            <p className="text-muted-foreground">No audit entries yet.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Hash (first 12)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline">{e.entityType}</Badge></TableCell>
                      <TableCell>{e.action}</TableCell>
                      <TableCell className="text-xs">{e.actor} ({e.actorType})</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{e.details || '—'}</TableCell>
                      <TableCell><code className="text-xs">{e.entryHash.slice(0, 12)}</code></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
