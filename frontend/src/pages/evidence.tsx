import { useState } from "react"
import { Upload, FileText, HardDrive, Link2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import { FadeInRow, FadeInCard } from "@/components/animations/fade-in"

const summaryCards = [
  { label: "Total items", value: "1,284", icon: FileText, iconBg: "bg-accent-primary/10", iconColor: "text-accent-primary" },
  { label: "Storage used", value: "18.4 GB", icon: HardDrive, iconBg: "bg-accent-secondary/10", iconColor: "text-accent-secondary" },
  { label: "Chain anchor status", value: "Synced", icon: Link2, iconBg: "bg-status-compliant/10", iconColor: "text-status-compliant", extra: "· Block #2026-189", dot: true },
]

export default function EvidencePage() {
  const { evidence, complianceObligations, uploadEvidence } = useAppStore()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({ filename: "", size: "", obligation: "" })

  const handleUpload = () => {
    if (!uploadForm.filename || !uploadForm.size || !uploadForm.obligation) return
    uploadEvidence(uploadForm.filename, uploadForm.size, uploadForm.obligation, "R. Iyer")
    setUploadForm({ filename: "", size: "", obligation: "" })
    setShowUploadModal(false)
  }

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Evidence Vault</h1>
          <p className="mt-2 text-sm text-text-secondary">Immutable evidence store — hashed and chain-anchored for audit.</p>
        </div>
        <Button size="sm" onClick={() => setShowUploadModal(true)}>
          <Upload className="h-4 w-4 mr-2" />Upload evidence
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {summaryCards.map((card, i) => (
          <FadeInCard key={card.label} delay={i * 50}>
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{card.label}</span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}><card.icon className={`h-5 w-5 ${card.iconColor}`} /></div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  {card.dot && (<div className="relative"><div className="h-2.5 w-2.5 rounded-full bg-status-compliant" /><div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-status-compliant animate-ping opacity-75" /></div>)}
                  <span className="text-xl font-semibold text-text-primary">{card.value}</span>
                  {card.extra && (<span className="text-xs text-text-tertiary">{card.extra}</span>)}
                </div>
              </CardContent>
            </Card>
          </FadeInCard>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-card-hover">
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">File</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Obligation</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Uploaded by</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {evidence.map((e, i) => (
                  <FadeInRow key={e.id} delay={i * 40} highlight={false}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-card-hover"><FileText className="h-4 w-4 text-text-tertiary" /></div>
                        <div><div className="font-medium text-sm text-text-primary leading-relaxed">{e.filename}</div><div className="text-xs text-text-tertiary font-mono mt-1.5">{e.id}</div></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-text-secondary">{e.size}</td>
                    <td className="px-6 py-5"><span className="text-sm text-accent-primary hover:underline cursor-pointer">{e.obligation}</span></td>
                    <td className="px-6 py-5 text-sm text-text-secondary">{e.uploadedBy}</td>
                    <td className="px-6 py-5 text-sm text-text-secondary">{e.date}</td>
                    <td className="px-6 py-5"><code className="text-xs font-mono text-text-tertiary bg-bg-card-hover px-2.5 py-1 rounded-lg">{e.hash}</code></td>
                  </FadeInRow>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in-up">
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-card p-8 space-y-6 animate-scale-in">
            <h2 className="text-lg font-semibold text-text-primary">Upload Evidence</h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-text-secondary">Filename</label>
                <input type="text" value={uploadForm.filename} onChange={(e) => setUploadForm({ ...uploadForm, filename: e.target.value })} placeholder="e.g. VAPT_Report.pdf" className="mt-2 h-11 w-full rounded-xl border border-border-subtle bg-bg-base px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary">File size</label>
                <input type="text" value={uploadForm.size} onChange={(e) => setUploadForm({ ...uploadForm, size: e.target.value })} placeholder="e.g. 2.5 MB" className="mt-2 h-11 w-full rounded-xl border border-border-subtle bg-bg-base px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary">Linked obligation</label>
                <select value={uploadForm.obligation} onChange={(e) => setUploadForm({ ...uploadForm, obligation: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-border-subtle bg-bg-base px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary">
                  <option value="">Select obligation...</option>
                  {complianceObligations.map(o => (
                    <option key={o.id} value={o.id}>{o.id} — {o.text.substring(0, 40)}...</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleUpload}>Upload</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
