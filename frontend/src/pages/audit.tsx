import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import { FadeInRow } from "@/components/animations/fade-in"

function getActorInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("")
}

const actorColors: Record<string, string> = {
  "R. Iyer": "bg-accent-primary/20 text-accent-primary",
  "N. Menon": "bg-status-under-review/20 text-status-under-review",
  "A. Kulkarni": "bg-status-at-risk/20 text-status-at-risk",
  "P. Sharma": "bg-accent-secondary/20 text-accent-secondary",
  "System": "bg-status-compliant/20 text-status-compliant",
  "Copilot": "bg-accent-secondary/20 text-accent-secondary",
}

export default function AuditPage() {
  const { auditEntries } = useAppStore()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Audit Trail</h1>
        <p className="mt-2 text-sm text-text-secondary">Cryptographically-signed record of every action across the platform.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-7 py-5 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="relative"><div className="h-2.5 w-2.5 rounded-full bg-status-compliant" /><div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-status-compliant animate-ping opacity-75" /></div>
              <span className="text-sm font-medium text-status-compliant">Ledger integrity: Verified</span>
              <span className="text-sm text-text-tertiary">· Last check 2 min ago</span>
            </div>
            <span className="text-sm text-text-secondary font-mono">Chain height: 2026-189</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-card-hover">
                  <th className="px-7 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider w-40">Timestamp</th>
                  <th className="px-7 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider w-32">Actor</th>
                  <th className="px-7 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Action</th>
                  <th className="px-7 py-4 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider w-28">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {auditEntries.map((entry, i) => (
                  <FadeInRow key={i} delay={i * 40} highlight={i === 0}>
                    <td className="px-7 py-5 text-xs font-mono text-text-tertiary w-40">{entry.timestamp}</td>
                    <td className="px-7 py-5 w-32">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-medium", actorColors[entry.actor] || "bg-bg-card-hover text-text-secondary")}>{getActorInitials(entry.actor)}</div>
                        <span className="text-sm text-text-primary">{entry.actor}</span>
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <span className="text-sm text-text-secondary leading-relaxed">{entry.action} </span>
                      <span className="text-sm text-accent-primary font-mono">{entry.entity}</span>
                    </td>
                    <td className="px-7 py-5 text-xs font-mono w-28 text-right text-text-tertiary">{entry.ip || "-"}</td>
                  </FadeInRow>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
