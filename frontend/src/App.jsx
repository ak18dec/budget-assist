import React from 'react'
import './App.css'
import { FiBell } from 'react-icons/fi'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Dashboard from './components/Dashboard'
import ChatPanel from './components/ChatPanel'
import Sidebar from './components/Sidebar'
import SummaryCards from './components/SummaryCards'
import FinancialChart from './components/FinancialChart'
import PieChart from './components/PieChart'
import RecentTransactions from './components/RecentTransactions'
import SavingsList from './components/SavingsList'
import Topbar from './components/Topbar'

// small utility: fetch transactions and export CSV
async function fetchTransactions(){
  try{
    const res = await fetch('/api/v1/transactions')
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
        // escape quotes
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

function NotificationBell(){
  const [open, setOpen] = React.useState(false)
  const btnRef = React.useRef(null)
  const menuRef = React.useRef(null)

  const notifications = [
    {id:1, title:'Budget exceeded', text:'You exceeded Food budget by $23', time:'2h'},
    {id:2, title:'Goal updated', text:'Saved $150 towards Emergency Fund', time:'1d'},
    {id:3, title:'Payment due', text:'Credit card payment due in 3 days', time:'3d'},
  ]

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

  const toggle = ()=> setOpen(v=>!v)

  return (
    <div style={{position:'relative'}}>
      <button ref={btnRef} className="icon-btn notif" aria-haspopup="menu" aria-expanded={open} onClick={toggle} onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); toggle() } }}>
        <FiBell size={18} />
        <span className="notif-dot" />
      </button>

      {open && (
        <div ref={menuRef} className="notif-dropdown card" role="menu" aria-label="Notifications list" style={{position:'absolute', right:0, top:40, width:300, zIndex:30}}>
          <div style={{fontWeight:700, marginBottom:8}}>Notifications</div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {notifications.map(n=> (
              <button key={n.id} className="notif-item" role="menuitem" onClick={()=>{ setOpen(false); alert(n.title + '\n' + n.text) }}>
                <div style={{fontWeight:600}}>{n.title}</div>
                <div className="muted" style={{fontSize:12}}>{n.text}</div>
                <div className="muted" style={{fontSize:11, marginTop:6}}>{n.time}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App(){
  const [chatExpanded, setChatExpanded] = React.useState(true)
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true)

  return (
    <div style={{display:'flex', gap:20, height:'100vh', overflow:'hidden'}}>
      <div style={{width: sidebarExpanded ? 220 : 70, flexShrink:0, transition: 'width 0.3s ease'}}>
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      </div>
      
      {/* Main Content - Dashboard */}
      <div style={{flex:1, minWidth:0, overflowY:'auto', paddingRight:12}}>
        <Topbar />

        {/* Full width summary cards */}
        <div className="card" style={{marginBottom:12}}>
          <SummaryCards />
        </div>

        {/* Bar chart and pie chart side-by-side */}
        <div style={{display:'grid', gridTemplateColumns: '2fr 1fr', gap:12}}>
          <div className="card">
            <FinancialChart />
          </div>
          <div className="card">
            {/* <PieChart data={[{label:'Groceries', value:30},{label:'Housing', value:57.5},{label:'Education', value:12.5}]} /> */}
          </div>
        </div>

        {/* Bottom section: recent transactions + savings (right) matching reference layout */}
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, marginTop:12}}>
          <div className="card">
            <RecentTransactions />
          </div>
          {!chatExpanded && (
            <div className="card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3 style={{marginTop:0}}>Savings</h3>
                <div style={{display:'flex', gap:8}}>
                  <button className="pie-tab active">All</button>
                  <button className="pie-tab">Goals</button>
                </div>
              </div>
              <div style={{marginTop:12}}>
                <SavingsList />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel - Right Sidebar */}
      <div style={{
        width: chatExpanded ? 350 : 60,
        display:'flex',
        flexDirection:'column',
        flexShrink:0,
        transition: 'width 0.3s ease',
        borderLeft: '1px solid var(--border-light)',
        paddingLeft: 12,
        paddingRight: 0,
        overflowY:'auto'
      }}>
        <ChatPanel expanded={chatExpanded} onToggle={() => setChatExpanded(!chatExpanded)} />
      </div>
    </div>
  )
}
