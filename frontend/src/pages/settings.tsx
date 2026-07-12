import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Tab = "Organization" | "Members" | "Integrations" | "Security" | "Billing"

const tabs: Tab[] = ["Organization", "Members", "Integrations", "Security", "Billing"]

const members = [
  { name: "R. Iyer", email: "r.iyer@kotaksec.in", role: "Chief Compliance Officer" },
  { name: "P. Sharma", email: "p.sharma@kotaksec.in", role: "KYC Analyst" },
  { name: "N. Menon", email: "n.menon@kotaksec.in", role: "Legal Counsel" },
  { name: "A. Kulkarni", email: "a.kulkarni@kotaksec.in", role: "InfoSec Lead" },
  { name: "S. Rao", email: "s.rao@kotaksec.in", role: "Fund Accountant" },
]

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-card",
        checked ? "bg-accent-primary" : "bg-bg-card-hover"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

function OrganizationTab() {
  const [breachAlerts, setBreachAlerts] = useState(true)
  const [dailyDigest, setDailyDigest] = useState(true)

  return (
    <div className="space-y-10">
      {/* Organization Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
          <p className="text-xs text-text-tertiary mt-1.5">Legal entity registered with SEBI.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-text-secondary">Legal Name</label>
              <Input value="Kotak Securities Ltd." readOnly className="bg-bg-base h-11 rounded-xl" />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-text-secondary">SEBI Reg. No.</label>
              <Input value="INZ000200137" readOnly className="bg-bg-base h-11 rounded-xl" />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-text-secondary">PAN</label>
              <Input value="AAACK0000L" readOnly className="bg-bg-base h-11 rounded-xl" />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-text-secondary">Principal Officer</label>
              <Input value="R. Iyer" readOnly className="bg-bg-base h-11 rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
          <p className="text-xs text-text-tertiary mt-1.5">Users with access to this workspace.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-card-hover">
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {members.map((m) => (
                  <tr key={m.email} className="hover:bg-bg-card-hover transition-colors">
                    <td className="px-6 py-5 text-sm font-medium text-text-primary">{m.name}</td>
                    <td className="px-6 py-5 text-sm text-text-secondary font-mono">{m.email}</td>
                    <td className="px-6 py-5 text-sm text-text-secondary">{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <p className="text-xs text-text-tertiary mt-1.5">How and when ClauseChain alerts your team.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Breach alerts</p>
              <p className="text-xs text-text-tertiary mt-1.5 leading-relaxed">Instant email + Slack when an obligation crosses SLA.</p>
            </div>
            <Toggle checked={breachAlerts} onChange={setBreachAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Daily digest</p>
              <p className="text-xs text-text-tertiary mt-1.5 leading-relaxed">At 8:00 IST, a summary of upcoming due obligations.</p>
            </div>
            <Toggle checked={dailyDigest} onChange={setDailyDigest} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-24">
        <p className="text-sm text-text-tertiary">{title} settings coming soon.</p>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Organization")

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
        <p className="mt-2 text-sm text-text-secondary">Workspace, members, integrations and compliance policy.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-subtle">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "border-accent-primary text-accent-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "Organization" && <OrganizationTab />}
      {activeTab === "Members" && <PlaceholderTab title="Members" />}
      {activeTab === "Integrations" && <PlaceholderTab title="Integrations" />}
      {activeTab === "Security" && <PlaceholderTab title="Security" />}
      {activeTab === "Billing" && <PlaceholderTab title="Billing" />}
    </div>
  )
}
