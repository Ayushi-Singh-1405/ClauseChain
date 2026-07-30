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
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [rawText, setRawText] = useState('')
  const [ingesting, setIngesting] = useState(false)

  useEffect(() => {
    api.get<Circular[]>('/api/circulars').then(setCirculars).finally(() => setLoading(false))
  }, [])

  async function handleIngest() {
    if (!title || !rawText) return
    setIngesting(true)
    try {
      const circ = await api.post<{ id: string }>('/api/circulars/ingest', { title, rawText })
      setCirculars((prev) => [...prev, { ...circ, source: '', ref: null, status: 'ingested', createdAt: new Date().toISOString(), _count: { clauses: 0, rules: 0 } } as Circular])
      setOpen(false)
      setTitle('')
      setRawText('')
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setIngesting(false)
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>Ingest New</Button>} />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ingest Circular</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          ) : circulars.length === 0 ? (
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
