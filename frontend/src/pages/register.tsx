import { useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import { FadeInRow } from "@/components/animations/fade-in"

const statusBadgeVariant: Record<string, "compliant" | "pending" | "under-review" | "at-risk" | "overdue"> = {
  Compliant: "compliant",
  Pending: "pending",
  "Under Review": "under-review",
  "At Risk": "at-risk",
  Overdue: "overdue",
}

const filterChips = ["All", "Compliant", "In review", "At risk", "Breach"] as const
type FilterChip = typeof filterChips[number]

function matchesFilter(status: string, chip: FilterChip): boolean {
  if (chip === "All") return true
  if (chip === "Compliant") return status === "Compliant"
  if (chip === "In review") return status === "Under Review" || status === "Pending"
  if (chip === "At risk") return status === "At Risk"
  if (chip === "Breach") return status === "Overdue"
  return false
}

export default function RegisterPage() {
  const { complianceObligations } = useAppStore()
  const [activeFilter, setActiveFilter] = useState<FilterChip>("All")
  const [search, setSearch] = useState("")

  const filtered = complianceObligations.filter((o) => {
    const matchesChip = matchesFilter(o.status, activeFilter)
    const matchesSearch = search === "" || o.text.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
    return matchesChip && matchesSearch
  })

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Compliance Register</h1>
        <p className="mt-2 text-sm text-text-secondary">Master ledger of every obligation, its owner, evidence and status.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input type="text" placeholder="Filter obligations..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 w-full rounded-xl border border-border-subtle bg-bg-card pl-11 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1 focus:ring-offset-bg-base" />
        </div>
        <div className="flex items-center gap-2.5">
          {filterChips.map((chip) => (
            <button key={chip} onClick={() => setActiveFilter(chip)} className={cn("inline-flex items-center rounded-full px-4 py-2 text-xs font-medium transition-colors", activeFilter === chip ? "bg-accent-primary text-white" : "bg-bg-card-hover text-text-secondary hover:text-text-primary")}>{chip}</button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-card-hover">
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Obligation</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Clause</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Due</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Evidence</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((o, i) => (
                  <FadeInRow key={o.id} delay={i * 30} highlight={false}>
                    <td className="px-6 py-5 text-sm font-mono text-text-secondary">{o.id}</td>
                    <td className="px-6 py-5 max-w-xs"><div className="font-medium text-sm text-text-primary leading-relaxed">{o.text}</div><div className="text-xs text-text-tertiary font-mono mt-1.5">{o.circularRef}</div></td>
                    <td className="px-6 py-5 text-sm text-text-secondary font-mono">{o.clause}</td>
                    <td className="px-6 py-5 text-sm text-text-secondary">{o.owner}</td>
                    <td className="px-6 py-5 text-sm text-text-secondary">{o.due}</td>
                    <td className="px-6 py-5"><span className={cn("text-sm", o.evidence === 0 ? "text-status-overdue" : "text-text-secondary")}>{o.evidence} {o.evidence === 1 ? "file" : "files"}</span></td>
                    <td className="px-6 py-5"><Badge variant={statusBadgeVariant[o.status]}>{o.status}</Badge></td>
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
