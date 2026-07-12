import {
  FileText,
  ClipboardCheck,
  ListTodo,
  AlertTriangle,
  TrendingUp,
  Plus,
  Download,
  ArrowRight,
  Clock,
  Upload,
  Link2,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import { AnimatedNumber } from "@/components/animations/animated-number"

export default function DashboardPage() {
  const { circulars, extractedObligations, tasks, complianceObligations } = useAppStore()

  const pendingApprovals = extractedObligations.filter(o => o.status === "pending").length
  const openTasks = tasks.filter(t => t.status !== "done").length
  const overdueTasks = tasks.filter(t => {
    const obligation = complianceObligations.find(o => o.id === t.obligation)
    return obligation?.status === "Overdue"
  }).length

  const metrics = [
    { label: "New Circulars", value: 3, sub: "+2 this week", subColor: "text-text-secondary", icon: FileText, iconColor: "text-accent-primary", iconBg: "bg-accent-primary/10", isPercentage: false },
    { label: "Pending Rule Approvals", value: pendingApprovals, sub: "4 high confidence", subColor: "text-text-secondary", icon: ClipboardCheck, iconColor: "text-status-under-review", iconBg: "bg-status-under-review/10", isPercentage: false },
    { label: "Open Compliance Tasks", value: openTasks, sub: "9 due this week", subColor: "text-text-secondary", icon: ListTodo, iconColor: "text-status-at-risk", iconBg: "bg-status-at-risk/10", isPercentage: false },
    { label: "Overdue Tasks", value: overdueTasks, sub: "Escalated", subColor: "text-status-overdue", icon: AlertTriangle, iconColor: "text-status-overdue", iconBg: "bg-status-overdue/10", isPercentage: false },
    { label: "Compliance Score", value: 96, sub: "▲ +4 vs last month", subColor: "text-status-compliant", icon: TrendingUp, iconColor: "text-status-compliant", iconBg: "bg-status-compliant/10", isPercentage: true },
  ]

  const activityItems = [
    { icon: FileText, iconColor: "text-accent-primary", title: "New SEBI Circular detected", subtitle: "SEBI/HO/MIRSD/POD-1/P/CIR/2026/108 · Enhanced KYC", time: "12 min ago" },
    { icon: ClipboardCheck, iconColor: "text-accent-secondary", title: "27 obligations extracted", subtitle: "Copilot parsed clauses across 4 circulars", time: "38 min ago" },
    { icon: Clock, iconColor: "text-status-at-risk", title: "Human approval pending", subtitle: "R. Iyer to review 12 proposed obligations", time: "1h ago" },
    { icon: ListTodo, iconColor: "text-accent-primary", title: "Annual VAPT task created", subtitle: "T-8820 assigned to A. Kulkarni", time: "3h ago" },
    { icon: Upload, iconColor: "text-status-compliant", title: "Evidence uploaded", subtitle: "Q2_VAPT_Report_2026.pdf · 4.2 MB", time: "5h ago" },
    { icon: Link2, iconColor: "text-accent-secondary", title: "Audit log updated", subtitle: "Ledger block #2026-189 anchored", time: "8h ago" },
  ]

  const circularsData = circulars.slice(0, 4).map((c, i) => ({
    ...c,
    progress: [92, 76, 100, 58][i],
  }))

  const recentTasks = tasks.slice(0, 5).map(t => {
    const obligation = complianceObligations.find(o => o.id === t.obligation)
    return { ...t, statusLabel: obligation?.status || "Pending" }
  })

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Compliance overview</h1>
          <p className="mt-2 text-sm text-text-secondary">Real-time posture across SEBI obligations, circulars and evidence.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export report</Button>
          <Button size="sm"><Plus className="h-4 w-4 mr-2" />New obligation</Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {metrics.map((m, i) => (
          <Card key={m.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{m.label}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.iconBg}`}><m.icon className={`h-5 w-5 ${m.iconColor}`} /></div>
              </div>
              <div className="text-3xl font-semibold text-text-primary mt-4">
                <AnimatedNumber value={m.value} className="tabular-nums" />
                {m.isPercentage && "%"}
              </div>
              <p className={`text-xs mt-3 ${m.subColor}`}>{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-base">Recent activity</CardTitle><p className="text-xs text-text-tertiary mt-1.5">Live feed from Copilot, tasks and audit ledger</p></div>
              <button className="flex items-center gap-1 text-xs font-medium text-accent-primary hover:text-accent-primary/80 transition-colors">View audit<ArrowRight className="h-3 w-3" /></button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0 divide-y divide-border-subtle">
              {activityItems.map((item, i) => (
                <div key={i} className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-bg-card-hover"><item.icon className={`h-4 w-4 ${item.iconColor}`} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-text-primary leading-relaxed">{item.title}</p><p className="text-xs text-text-tertiary truncate mt-1 leading-relaxed">{item.subtitle}</p></div>
                  <span className="text-xs text-text-tertiary whitespace-nowrap flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-base">Recent Circulars</CardTitle><p className="text-xs text-text-tertiary mt-1.5">Ingestion & extraction progress</p></div>
              <button className="text-xs font-medium text-accent-primary hover:text-accent-primary/80 transition-colors">All</button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-5">
              {circularsData.map((c) => (
                <div key={c.id} className="rounded-xl border border-border-subtle bg-bg-base p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium text-text-primary truncate leading-relaxed">{c.title}</p><p className="text-xs text-text-tertiary mt-1.5 font-mono">{c.ref}</p><p className="text-xs text-text-tertiary mt-2 leading-relaxed">Updated {c.date === "2026-07-08" ? "today" : c.date === "2026-07-02" ? "12 min ago" : c.date === "2026-06-24" ? "yesterday" : "2 days ago"}</p></div>
                    <span className={`text-xs font-medium flex-shrink-0 ${c.progress === 100 ? "text-status-compliant" : "text-text-secondary"}`}>{c.progress}%</span>
                  </div>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-bg-card-hover overflow-hidden"><div className={`h-full rounded-full transition-all ${c.progress === 100 ? "bg-status-compliant" : "bg-accent-primary"}`} style={{ width: `${c.progress}%` }} /></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle className="text-base">Recent compliance tasks</CardTitle><p className="text-xs text-text-tertiary mt-1.5">Assigned across the compliance team</p></div>
            <button className="flex items-center gap-1 text-xs font-medium text-accent-primary hover:text-accent-primary/80 transition-colors">Open board<ExternalLink className="h-3 w-3" /></button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto rounded-xl border border-border-subtle">
            <table className="w-full">
              <thead><tr className="border-b border-border-subtle bg-bg-card-hover">
                <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Task</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Due</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-border-subtle">
                {recentTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-bg-card-hover transition-colors">
                    <td className="px-6 py-5 text-sm font-mono text-text-secondary">{t.id}</td>
                    <td className="px-6 py-5 text-sm text-text-primary">{t.title}</td>
                    <td className="px-6 py-5 text-sm text-text-secondary">{t.owner}</td>
                    <td className="px-6 py-5 text-sm text-text-secondary">{t.due}</td>
                    <td className="px-6 py-5"><Badge variant={t.statusLabel === "Compliant" ? "compliant" : t.statusLabel === "Pending" ? "pending" : t.statusLabel === "Under Review" ? "under-review" : t.statusLabel === "At Risk" ? "at-risk" : "overdue"}>{t.statusLabel}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
