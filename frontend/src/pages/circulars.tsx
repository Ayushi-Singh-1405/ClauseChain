import { useNavigate } from "react-router-dom"
import { Filter, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

const categoryColors: Record<string, string> = {
  "KYC/AML": "bg-accent-primary/10 text-accent-primary",
  "Disclosure": "bg-accent-secondary/10 text-accent-secondary",
  "Cyber": "bg-status-under-review/10 text-status-under-review",
  "Reporting": "bg-status-at-risk/10 text-status-at-risk",
  "Filing": "bg-status-pending/10 text-status-pending",
  "Client Assets": "bg-status-compliant/10 text-status-compliant",
}

const impactStyles = {
  High: { dot: "bg-status-overdue", text: "text-status-overdue" },
  Medium: { dot: "bg-status-at-risk", text: "text-status-at-risk" },
  Low: { dot: "bg-text-tertiary", text: "text-text-tertiary" },
}

export default function CircularsPage() {
  const navigate = useNavigate()
  const { circulars } = useAppStore()

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Circulars</h1>
          <p className="mt-2 text-sm text-text-secondary">Every SEBI circular ingested, parsed and mapped to obligations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-card-hover">
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Circular</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Impact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Obligations</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {circulars.map((c) => (
                  <tr key={c.ref} onClick={() => navigate("/rule-review")} className="hover:bg-bg-card-hover transition-colors cursor-pointer">
                    <td className="px-6 py-5"><div className="font-medium text-sm text-text-primary leading-relaxed">{c.title}</div><div className="text-xs text-text-tertiary font-mono mt-1.5">{c.ref}</div></td>
                    <td className="px-6 py-5"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${categoryColors[c.category] || "bg-bg-card-hover text-text-secondary"}`}>{c.category}</span></td>
                    <td className="px-6 py-5 text-sm text-text-secondary">{c.date}</td>
                    <td className="px-6 py-5"><div className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${impactStyles[c.impact].dot}`} /><span className={`text-sm font-medium ${impactStyles[c.impact].text}`}>{c.impact}</span></div></td>
                    <td className="px-6 py-5 text-sm font-medium text-text-primary">{c.obligations}</td>
                    <td className="px-6 py-5"><Badge variant={c.status === "Under Review" ? "under-review" : "compliant"}>{c.status}</Badge></td>
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
