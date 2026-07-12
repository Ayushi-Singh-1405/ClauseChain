import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

function ConfidenceBadge({ value }: { value: number }) {
  if (value >= 90) return <span className="text-xs font-medium text-status-compliant">{value}%</span>
  if (value >= 80) return <span className="text-xs font-medium text-status-at-risk">{value}%</span>
  return <span className="text-xs font-medium text-orange-400">{value}%</span>
}

export default function RuleReviewPage() {
  const { extractedObligations, approveObligation, rejectObligation } = useAppStore()
  const pendingObligations = extractedObligations.filter(o => o.status === "pending")

  const handleApprove = (id: string) => {
    approveObligation(id, "R. Iyer")
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Rule Review</h1>
        <p className="mt-2 text-sm text-text-secondary">Copilot-extracted obligations awaiting compliance officer approval.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader>
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Source circular</span>
            <CardTitle className="text-base mt-3">Enhanced KYC for High-Value Trading Accounts</CardTitle>
            <p className="text-xs text-text-tertiary font-mono mt-2">SEBI/HO/MIRSD/POD-1/P/CIR/2026/108</p>
            <div className="flex items-center gap-3 mt-4">
              <Badge variant="under-review">Under Review</Badge>
              <span className="inline-flex items-center rounded-full bg-bg-card-hover px-2.5 py-1 text-xs font-medium text-text-secondary">KYC/AML</span>
              <span className="text-xs text-text-tertiary">2026-07-08</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-xl border border-border-subtle bg-bg-base p-6 text-sm text-text-secondary leading-relaxed space-y-4">
              <p>The Board, in exercise of the powers conferred by Section 11(1) of the SEBI Act, 1992, hereby issues the following directions applicable to all registered intermediaries with immediate effect...</p>
              <p>1. All intermediaries shall implement enhanced Know-Your-Customer (KYC) protocols for accounts exceeding the specified threshold. This includes verification of Permanent Account Number (PAN) linkage with Aadhaar...</p>
              <p>2. High Net-worth Individual accounts shall be subject to quarterly video-KYC verification. The intermediary shall maintain records of such verifications for a period of not less than eight years...</p>
              <p className="text-text-tertiary italic">— truncated —</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-7">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10"><Sparkles className="h-5 w-5 text-accent-primary" /></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Copilot extracted {pendingObligations.length} obligations</p>
                    <p className="text-xs text-text-tertiary mt-1.5">{pendingObligations.filter(o => o.isMapped).length} need review · {pendingObligations.filter(o => !o.isMapped).length} auto-mapped to existing register</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => pendingObligations.forEach(o => handleApprove(o.id))}>Approve all high-confidence</Button>
              </div>
            </CardContent>
          </Card>

          {pendingObligations.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-7">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-xs text-text-tertiary font-mono">{o.id} · {o.regulation} · {o.mapping ? `→ ${o.mapping}` : ""}</div>
                  <ConfidenceBadge value={o.confidence} />
                </div>
                <p className="text-sm text-text-primary leading-relaxed mb-5">{o.text}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${o.isMapped ? "text-status-compliant" : "text-status-at-risk"}`}>{o.isMapped ? "Mapped to existing obligation" : "New obligation — needs mapping"}</span>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => rejectObligation(o.id)}>Reject</Button>
                    <Button size="sm" onClick={() => handleApprove(o.id)}>Approve</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
