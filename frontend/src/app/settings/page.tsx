'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<Record<string, string>>('/api/settings').then(setSettings).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await api.patch<Record<string, string>>('/api/settings', settings)
      setSettings(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  if (!settings) return <p className="text-muted-foreground">Failed to load settings.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Application Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings).map(([key, val]) => (
            <div key={key}>
              <label className="text-sm font-medium capitalize mb-1 block">{key.replace(/([A-Z])/g, ' $1')}</label>
              <Input value={val} onChange={(e) => setSettings((s) => s ? { ...s, [key]: e.target.value } : s)} />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            {saved && <span className="text-sm text-green-600">Saved!</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
