import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ChatPanel from '../components/ChatPanel'

export default function AppLayout() {
  const [chatExpanded, setChatExpanded] = React.useState(false)
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true)

  return (
    <div style={{ display: 'flex', gap: 20, height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ width: sidebarExpanded ? 220 : 70, transition: 'width 0.3s' }}>
        <Sidebar
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />
      </div>

      {/* Main routed content */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', paddingRight: 12 }}>
        <Topbar />
        <Outlet /> {/* 👈 Routes render here */}
      </div>

      {/* Chat panel */}
      <div
        style={{
          width: chatExpanded ? 350 : 60,
          display:'flex',
          flexDirection:'column',
          flexShrink:0,
          transition: 'width 0.3s',
          borderLeft: '1px solid var(--border-light)',
          transition: 'width 0.3s ease',
          paddingLeft: 12,
          paddingRight: 0,
          overflowY:'auto'
        }}
      >
        <ChatPanel
          expanded={chatExpanded}
          onToggle={() => setChatExpanded(!chatExpanded)}
        />
      </div>
    </div>
  )
}
