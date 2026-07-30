'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Scale,
  ClipboardCheck,
  ListChecks,
  Upload,
  ScrollText,
  Bot,
  Settings,
  LogIn,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Circulars', href: '/circulars', icon: FileText },
  { label: 'Rule Review', href: '/rule-review', icon: Scale },
  { label: 'Register', href: '/register', icon: ClipboardCheck },
  { label: 'Tasks', href: '/tasks', icon: ListChecks },
  { label: 'Evidence', href: '/evidence', icon: Upload },
  { label: 'Audit Trail', href: '/audit', icon: ScrollText },
  { label: 'Copilot', href: '/copilot', icon: Bot },
  { label: 'Login', href: '/login', icon: LogIn },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token && pathname !== '/login') {
      router.replace('/login')
    }
  }, [pathname, router])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Scale className="h-6 w-6" />
          <span className="font-semibold text-lg">ClauseChain</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname === item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
