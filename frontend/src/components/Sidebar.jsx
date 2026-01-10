import React, {useState} from 'react'
import { FiGrid, FiList, FiDollarSign, FiUsers, FiBarChart2, FiBell, FiHelpCircle, FiSettings, FiChevronRight } from 'react-icons/fi'
import { GoCreditCard } from "react-icons/go";
import './Sidebar.css'

const navItems = [
  {key:'dashboard', label:'Dashboard', icon:FiGrid},
  {key:'transactions', label:'Transactions', icon:GoCreditCard},
  {key:'budget', label:'Budget Planner', icon:FiDollarSign},
  {key:'accounts', label:'Accounts', icon:FiUsers},
  {key:'reports', label:'Reports', icon:FiBarChart2},
  {key:'alerts', label:'Alerts', icon:FiBell},
]

function NavItem({icon:Icon, label, active, onClick}){
  return (
    <div className={`nav-item ${active? 'active':''}`} onClick={onClick} role="button">
      <div className="nav-icon"><Icon size={18} /></div>
      <div className="nav-label">{label}</div>
    </div>
  )
}

export default function Sidebar({ expanded, onToggle }){
  const [active, setActive] = useState('dashboard')

  return (
    <aside className={`sidebar card ${expanded ? '' : 'collapsed'}`}>
      <div className="brand-row">
        <div className="brand-mark"> <div className="cube"/> </div>
        {expanded && <div className="brand">BudgetAssist</div>}
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '‹' : '›'}
        </button>
      </div>

      <nav className="nav middle">
        {navItems.map(i=> (
          <NavItem key={i.key} icon={i.icon} label={expanded ? i.label : ''} active={active===i.key} onClick={()=>setActive(i.key)} />
        ))}
      </nav>

      {expanded && (
        <div className="sidebar-footer">
          <div className="footer-actions">
            <div className="footer-action"><FiHelpCircle size={16} /><div className="muted">Help</div></div>
            <div className="footer-action"><FiSettings size={16} /><div className="muted">Settings</div></div>
          </div>

          <div className="profile">
            <img src="https://i.pravatar.cc/40?img=5" alt="avatar" className="avatar" />
            <div className="profile-meta">
              <div className="profile-name">Ilham Rusdi</div>
              <div className="muted" style={{fontSize:12}}>ilhamrus@gmail.com</div>
            </div>
            <FiChevronRight size={18} className="chev" />
          </div>
        </div>
      )}
    </aside>
  )
}
