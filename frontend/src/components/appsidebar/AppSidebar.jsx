// import {
//     Sidebar,
//     SidebarContent,
//     SidebarFooter,
//     SidebarMenu,
//     SidebarMenuItem,
//     SidebarMenuButton,
//     SidebarHeader,
//     SidebarGroup,
//     SidebarGroupContent
// } from "@/components/ui/sidebar"

import {
  LayoutGrid,
  CreditCard,
  Trophy,
  Goal,
} from "lucide-react"

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid, to: '/' },
  { label: 'Transactions', icon: CreditCard, to: '/transactions' },
  { label: 'Budget Planner', icon: Trophy, to: '/budgets' },
  { label: 'Goals', icon: Goal, to: '/goals' }
]

// export default function AppSidebar() {
//     return (
//         <Sidebar>
//             <SidebarHeader />
//             <SidebarContent>
//                 <SidebarGroup>
//                     <SidebarGroupContent>
//                         <SidebarMenu>
//                             {navItems.map((item) => (
//                                 <SidebarMenuItem key={item.label} value={item.to}>
//                                     <SidebarMenuButton asChild isActive={item.isActive}>
//                                     <a href={item.to}>{item.label}</a>
//                                     </SidebarMenuButton>
//                                 </SidebarMenuItem>
//                             ))}
//                         </SidebarMenu>
//                     </SidebarGroupContent>
//                 </SidebarGroup>
//             </SidebarContent>
//             <SidebarFooter />
//         </Sidebar>
//   )
// }

import * as React from "react"
import {
  Command
} from "lucide-react"
import { NavProjects } from "@/components/appsidebar/NavProjects"
import { NavUser } from "@/components/appsidebar/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  }
}

export default function AppSidebar({ ...props }) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">BudgetAssist</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}