'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@clausechain.app')
  const [password, setPassword] = useState('demo')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { token } = await api.post<{ token: string }>('/api/auth/login', { email, password })
      localStorage.setItem('token', token)
      router.push('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-center">Sign In</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
            <p className="text-xs text-center text-muted-foreground">Demo: admin@clausechain.app / demo</p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
