'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface EvidenceItem {
  id: string
  taskId: string
  task: { title: string | null } | null
  filename: string
  fileData: string | null
  fileSize: string | null
  contentHash: string
  uploadedBy: string
  createdAt: string
}

interface TaskOption {
  id: string
  title: string
  status: string
}

export default function EvidencePage() {
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [tasks, setTasks] = useState<TaskOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    api.get<EvidenceItem[]>('/api/evidence')
      .then(setItems)
      .catch(() => setError('Failed to load evidence. Is the backend running?'))
      .finally(() => setLoading(false))
    api.get<TaskOption[]>('/api/tasks')
      .then(setTasks)
      .catch(() => {})
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
    if (file.size > 7 * 1024 * 1024) {
      setUploadError('File too large (max 7 MB).')
      return
    }
    setUploading(true)
    setUploadError(null)
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
      setUploadError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evidence</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setUploadError(null) }}>
          <DialogTrigger render={<Button>Upload Evidence</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Evidence</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {uploadError && (
                <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{uploadError}</p>
              )}
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <select
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                <option value="">No task (uncategorised)</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title} — {t.status}</option>
                ))}
              </select>
              <Button onClick={handleUpload} disabled={!file || uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Evidence</CardTitle></CardHeader>
        <CardContent>
          {error && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          ) : !error && items.length === 0 ? (
            <p className="text-muted-foreground">No evidence uploaded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Task</TableHead>
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
                    <TableCell className="text-xs">{e.task?.title || '—'}</TableCell>
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
