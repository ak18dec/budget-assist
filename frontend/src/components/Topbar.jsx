import {useEffect, useState, useRef} from 'react'
import { useLocation, Link } from "react-router-dom"
import { timeAgo } from '../utils/Formatters.js'
import { Button } from "@/components/ui/button"
import { Download, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from "next-themes"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const API_URL = import.meta.env.VITE_API_URL || '';

async function fetchTransactions(){
  try{
    const res = await fetch(`${API_URL}/transactions`)
    if(!res.ok) throw new Error('Network response not ok')
    const data = await res.json()
    return Array.isArray(data) ? data : (data.items || [])
  }catch(e){
    console.error('Failed to fetch transactions', e)
    return []
  }
}

function exportTransactions(){
  fetchTransactions().then(rows=>{
    if(!rows.length){
      alert('No transactions to export')
      return
    }
    const keys = ['id','date','description','amount','category','type']
    const csv = [keys.join(',')].concat(rows.map(r=>
      keys.map(k=> {
        const v = r[k] === undefined || r[k] === null ? '' : String(r[k])
        return '"' + v.replace(/"/g,'""') + '"'
      }).join(',')
    )).join('\n')

    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  })
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme" className="cursor-pointer">
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
    </Button>
  );
}

function NotificationBell(){
  const [notifications, setNotifications] = useState([])

  const btnRef = useRef(null)
  const menuRef = useRef(null)

  // const notifications = [
  //   {id:1, title:'Budget exceeded', text:'You exceeded Food budget by $23', time:'2h'},
  //   {id:2, title:'Goal updated', text:'Saved $150 towards Emergency Fund', time:'1d'},
  //   {id:3, title:'Payment due', text:'Credit card payment due in 3 days', time:'3d'},
  // ]

  async function loadNotifications() {
    try {
      const res = await fetch(`${API_URL}/notifications/`)
      if (!res.ok) return
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Failed to load notifications", e)
    }
  }

  // initial load + polling
  useEffect(() => {
    loadNotifications()
    const t = setInterval(loadNotifications, 100000)
    return () => clearInterval(t)
  }, [])

  // click outside + escape
  useEffect(()=>{
    function onDoc(e){
      if(menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)){
        setOpen(false)
      }
    }
    function onKey(e){ if(e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return ()=>{ document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  },[])

  const unreadCount = notifications.filter(n => !n.read).length

  async function markRead(id) {
    try {
      await fetch(`${API_URL}/api/v1/notifications/${id}/read/`, {
        method: 'POST',
      })
    } catch {}
    setNotifications(ns =>
      ns.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => markRead(n.id)}
                className="flex flex-col items-start gap-1 px-3 py-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium text-sm">
                    {n.title}
                  </span>
                  {!n.read && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {n.message}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {timeAgo(n.created_at)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Topbar(){
  const location = useLocation()
  const path = location.pathname
  const isDashboard = path === "/" || path === "/dashboard"

  const routeTitles = {
    transactions: "Transactions",
    budgets: "Budgets",
    goals: "Goals",
  }

  const segment = path.split("/")[1]
  const pageTitle = routeTitles[segment]

  return (
    <>
      <div id="title-header">
        {isDashboard ? (
          <>
            <h1 className="text-base font-medium text-sm">Good Morning, Harry</h1>
            <span className="text-xs">Welcome to your financial insights.</span>
          </>
          ) : (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> 
          )}
                
      </div>
      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
        <Button variant="ghost" size="sm" className="hidden sm:flex cursor-pointer" onClick={exportTransactions} >
          <Download />Export
        </Button>
      </div>
    </>
  )
}
