import { ChevronDown, Bell, Search } from "lucide-react"

export function TopBar() {
  return (
    <header className="h-16 flex-shrink-0 border-b border-border-subtle bg-bg-card px-8 flex items-center justify-between gap-5 overflow-hidden">
      {/* Left: Entity + Period */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-sm font-medium text-text-primary hover:text-accent-primary transition-colors">
          Kotak Securities
          <ChevronDown className="h-4 w-4 text-text-tertiary" />
        </button>
        <span className="inline-flex items-center rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-medium text-accent-primary">
          Q3 FY26
        </span>
      </div>

      {/* Center-right: Search */}
      <div className="flex-1 max-w-lg ml-auto">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search circulars, obligations, evidence..."
            className="h-10 w-full rounded-xl border border-border-subtle bg-bg-base pl-11 pr-12 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1 focus:ring-offset-bg-card"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <kbd className="rounded border border-border-subtle bg-bg-card px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-5">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent-primary" />
        </button>
        <div className="flex items-center gap-3 cursor-pointer min-w-0">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-primary text-xs font-semibold text-white">
            RI
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-text-primary leading-tight truncate">R. Iyer</span>
            <span className="text-[11px] text-text-tertiary leading-tight truncate">Chief Compliance Officer</span>
          </div>
        </div>
      </div>
    </header>
  )
}
