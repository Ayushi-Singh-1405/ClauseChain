'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface EvidenceItem {
  id: string
  taskId: string
  filename: string
  fileData: string | null
  fileSize: string | null
  contentHash: string
  uploadedBy: string
  createdAt: string
}

export default function EvidencePage() {
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api.get<EvidenceItem[]>('/api/evidence').then(setItems).finally(() => setLoading(false))
  }, [])

  function toBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(f)
    })
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    try {
      const fileData = await toBase64(file)
      const result = await api.post<EvidenceItem>('/api/evidence/upload', {
        taskId: selectedTask || undefined,
        filename: file.name,
        fileData,
      })
      setItems((prev) => [result, ...prev])
      setOpen(false)
      setFile(null)
      setSelectedTask('')
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evidence</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>Upload Evidence</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Evidence</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Input placeholder="Task ID (optional)" value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)} />
              <Button onClick={handleUpload} disabled={!file || uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Evidence</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">No evidence uploaded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.filename}</TableCell>
                    <TableCell>{e.fileSize ? `${Math.round(Number(e.fileSize) / 1024)} KB` : '—'}</TableCell>
                    <TableCell><code className="text-xs">{e.contentHash.slice(0, 12)}</code></TableCell>
                    <TableCell className="text-xs">{e.taskId ? e.taskId.slice(0, 12) + '…' : '—'}</TableCell>
                    <TableCell>{e.uploadedBy}</TableCell>
                    <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
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
