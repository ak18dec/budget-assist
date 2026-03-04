// import React from 'react'
// import { Outlet } from 'react-router-dom'
// import Sidebar from '../components/Sidebar'
// import Topbar from '../components/Topbar'
// import ChatPanel from '../components/ChatPanel'

// export default function AppLayout() {
//   const [chatExpanded, setChatExpanded] = React.useState(false)
//   const [sidebarExpanded, setSidebarExpanded] = React.useState(true)

//   return (
//     <div style={{ display: 'flex', gap: 20, height: '100vh', overflow: 'hidden' }}>
      
//       {/* Sidebar */}
//       <div style={{ width: sidebarExpanded ? 220 : 70, transition: 'width 0.3s' }}>
//         <Sidebar
//           expanded={sidebarExpanded}
//           onToggle={() => setSidebarExpanded(!sidebarExpanded)}
//         />
//       </div>

//       {/* Main routed content */}
//       <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', paddingRight: 12 }}>
//         <Topbar />
//         <Outlet /> {/* 👈 Routes render here */}
//       </div>

//       {/* Chat panel */}
//       <div
//         style={{
//           width: chatExpanded ? 350 : 60,
//           display:'flex',
//           flexDirection:'column',
//           flexShrink:0,
//           borderLeft: '1px solid var(--border-light)',
//           transition: 'width 0.3s ease',
//           paddingLeft: 12,
//           paddingRight: 0,
//           overflowY:'auto'
//         }}
//       >
//         <ChatPanel
//           expanded={chatExpanded}
//           onToggle={() => setChatExpanded(!chatExpanded)}
//         />
//       </div>
//     </div>
//   )
// }

import React from 'react'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import AppSidebar from './appsidebar/AppSidebar'
import Topbar from './Topbar'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {/* <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> */}
            <Topbar />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}