import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  ListTodo,
  Paperclip,
  History,
  MessageSquare,
  Settings,
  Shield,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/circulars", label: "Circulars", icon: <FileText className="h-4 w-4" /> },
  { to: "/rule-review", label: "Rule Review", icon: <ClipboardCheck className="h-4 w-4" /> },
  { to: "/register", label: "Compliance Register", icon: <ListTodo className="h-4 w-4" /> },
  { to: "/tasks", label: "Tasks", icon: <ListTodo className="h-4 w-4" /> },
  { to: "/evidence", label: "Evidence", icon: <Paperclip className="h-4 w-4" /> },
  { to: "/audit", label: "Audit Trail", icon: <History className="h-4 w-4" /> },
  { to: "/copilot", label: "Copilot", icon: <MessageSquare className="h-4 w-4" /> },
  { to: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex-shrink-0 h-screen border-r border-border-subtle bg-bg-card flex flex-col transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[72px]" : "w-[272px]"
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex h-16 items-center border-b border-border-subtle px-5 gap-3">
        <div className="flex items-center justify-center flex-shrink-0">
          <Shield className="h-5 w-5 text-accent-primary" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-text-primary leading-tight">ClauseChain</span>
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider leading-tight mt-0.5">SEBI Compliance</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-text-tertiary hover:bg-bg-card-hover hover:text-text-secondary transition-colors"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Section Label */}
      {!collapsed && (
        <div className="px-5 pt-5 pb-3">
          <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Workspace</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0" : "px-4",
                isActive
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
              )
            }
          >
            {item.icon}
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}

            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="pointer-events-none absolute left-full ml-2 z-50 hidden group-hover:block">
                <div className="rounded-md bg-bg-card border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-primary shadow-lg whitespace-nowrap">
                  {item.label}
                </div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status Card */}
      <div className="border-t border-border-subtle p-4">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-status-compliant" />
              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-status-compliant animate-ping opacity-75" />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border-subtle bg-bg-base/80 p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                <div className="h-2.5 w-2.5 rounded-full bg-status-compliant" />
                <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-status-compliant animate-ping opacity-75" />
              </div>
              <span className="text-xs font-semibold text-text-primary">Ledger synced</span>
            </div>
            <p className="text-[11px] text-text-tertiary mt-1.5 pl-[22px]">Block #2026-189 · 2 min ago</p>
          </div>
        )}
      </div>
    </aside>
  )
}
