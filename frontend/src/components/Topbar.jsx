import {useEffect, useState, useRef} from 'react'
import { FiSearch, FiBell, FiDownload, FiSun, FiMoon } from 'react-icons/fi'
import { timeAgo } from '../utils/Formatters.js'
import './Topbar.css'

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
  const [theme, setTheme] = useState(
    document.documentElement.dataset.theme || "light"
  );

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
  };

  return (
    <button
      className="button export"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <FiSun size={14} /> : <FiMoon size={14} />}
    </button>
  );
}

function NotificationBell(){
  const [open, setOpen] = useState(false)
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
      console.error('Failed to load notifications', e)
    }
  }

  // initial load + polling
  useEffect(() => {
    loadNotifications()
    const t = setInterval(loadNotifications, 10000)
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

  const toggle = ()=> setOpen(v=>!v)

  return (
    <div style={{position:'relative'}}>
      <button ref={btnRef} className="icon-btn notif" aria-haspopup="menu" aria-expanded={open} onClick={toggle} onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); toggle() } }}>
        <FiBell size={18} />
        {unreadCount > 0 && <span className="notif-dot" />}
      </button>

      {open && (
        <div ref={menuRef} className="notif-dropdown card" role="menu" aria-label="Notifications list" style={{position:'absolute', right:0, top:40, width:300, zIndex:30}}>
          <div style={{fontWeight:700, marginBottom:8}}>Notifications</div>
          {notifications.length === 0 && (
            <div className="muted" style={{ fontSize: 13 }}>
              No notifications
            </div>
          )}

          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {notifications.map(n=> (
              <button key={n.id} className={`notif-item ${n.read ? 'read' : ''}`} role="menuitem" 
                onClick={ () => {
                  markRead(n.id) 
                  setOpen(false); 
                }}>
                <div style={{fontWeight:600}}>{n.title}</div>
                <div className="muted" style={{fontSize:12}}>{n.message}</div>
                <div className="muted" style={{fontSize:11, marginTop:6}}>{timeAgo(n.created_at)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Topbar(){
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div>
          <h1 style={{margin:0, marginBottom:5}}>Good Morning, Harry</h1>
          <div className="muted" style={{fontSize:14}}>Welcome to your financial insights.</div>
        </div>
      </div>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Search">
          <FiSearch size={18} />
        </button>

        <NotificationBell />

        <ThemeToggle />

        <button className="button export" onClick={exportTransactions} aria-label="Export transactions">
          <FiDownload size={14} style={{marginRight:8}} />
          Export
        </button>
      </div>
    </div>
  )
}
