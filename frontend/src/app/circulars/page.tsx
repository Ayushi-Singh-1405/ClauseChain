'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface Circular {
  id: string
  title: string
  source: string
  ref: string | null
  status: string
  createdAt: string
  _count: { clauses: number; rules: number }
}

export default function CircularsPage() {
  const [circulars, setCirculars] = useState<Circular[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [rawText, setRawText] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [ingestError, setIngestError] = useState<string | null>(null)

  async function loadCirculars() {
    try {
      setCirculars(await api.get<Circular[]>('/api/circulars'))
    } catch {
      setError('Failed to load circulars. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.get<Circular[]>('/api/circulars')
      .then(setCirculars)
      .catch(() => setError('Failed to load circulars. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  async function handleIngest() {
    if (!title || !rawText) return
    setIngesting(true)
    setIngestError(null)
    try {
      await api.post<{ id: string }>('/api/circulars/ingest', { title, rawText })
      setOpen(false)
      setTitle('')
      setRawText('')
      await loadCirculars()
    } catch (e) {
      setIngestError((e as Error).message)
    } finally {
      setIngesting(false)
    }
  }

  async function handleProcess(id: string) {
    if (processingId) return
    setProcessingId(id)
    setError(null)
    try {
      const res = await api.post<{ clauseCount: number; failedCount: number }>(`/api/circulars/${id}/process`)
      if (res.failedCount > 0) {
        setError(`Processing finished with ${res.failedCount} of ${res.clauseCount} clause(s) failed. Click Process again to retry the remaining clauses.`)
      }
      await loadCirculars()
    } catch (e) {
      setError(`Processing failed: ${(e as Error).message}`)
    } finally {
      setProcessingId(null)
    }
  }

  const statusVariant = (s: string) => {
    if (s === 'extracted') return 'default' as const
    if (s === 'segmented') return 'secondary' as const
    return 'outline' as const
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Circulars</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setIngestError(null) }}>
          <DialogTrigger render={<Button>Ingest New</Button>} />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ingest Circular</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {ingestError && (
                <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{ingestError}</p>
              )}
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea
                className="w-full min-h-[300px] rounded-md border p-3 text-sm font-mono"
                placeholder="Paste circular text here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <Button onClick={handleIngest} disabled={ingesting}>
                {ingesting ? 'Ingesting...' : 'Ingest'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Circulars</CardTitle></CardHeader>
        <CardContent>
          {error && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          ) : !error && circulars.length === 0 ? (
            <p className="text-muted-foreground">No circulars yet. Ingest one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Clauses</TableHead>
                  <TableHead className="text-right">Rules</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {circulars.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.ref || '—'}</TableCell>
                    <TableCell><Badge variant={statusVariant(c.status)}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right">{c._count.clauses}</TableCell>
                    <TableCell className="text-right">{c._count.rules}</TableCell>
                    <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {c.status === 'ingested' || c.status === 'segmented' ? (
                        <Button size="sm" disabled={!!processingId} onClick={() => handleProcess(c.id)}>
                          {processingId === c.id ? 'Processing…' : 'Process'}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Ready</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
