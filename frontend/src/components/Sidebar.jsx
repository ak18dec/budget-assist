// import React, {useState} from 'react'
// import { FiGrid, FiList, FiDollarSign, FiUsers, FiBarChart2, FiBell, FiHelpCircle, FiSettings, FiChevronRight } from 'react-icons/fi'
// import { GoCreditCard } from "react-icons/go";
// import './Sidebar.css'
// import Logo from '../assets/logo.svg'

// const navItems = [
//   {key:'dashboard', label:'Dashboard', icon:FiGrid},
//   {key:'transactions', label:'Transactions', icon:GoCreditCard},
//   {key:'budget', label:'Budget Planner', icon:FiDollarSign},
//   {key:'accounts', label:'Accounts', icon:FiUsers},
//   {key:'reports', label:'Reports', icon:FiBarChart2},
//   {key:'alerts', label:'Alerts', icon:FiBell},
// ]

// function NavItem({icon:Icon, label, active, onClick}){
//   return (
//     <div className={`nav-item ${active? 'active':''}`} onClick={onClick} role="button">
//       <div className="nav-icon"><Icon size={18} /></div>
//       <div className="nav-label">{label}</div>
//     </div>
//   )
// }

// export default function Sidebar({ expanded, onToggle }){
//   const [active, setActive] = useState('dashboard')

//   return (
//     <aside className={`sidebar card ${expanded ? '' : 'collapsed'}`}>
//       <div className="brand-row" onClick={onToggle} style={{cursor:'pointer'}}>
//         <div className="brand-mark"> <div className="cube1"/> <img src={Logo} alt="Budget Assist" className="app-logo" /> </div>
//         {expanded && <div className="brand">BudgetAssist</div>}
//         {/* <button 
//           className="sidebar-toggle"
//           onClick={onToggle}
//           title={expanded ? 'Collapse' : 'Expand'}
//         >
//           {expanded ? '‹' : '›'}
//         </button> */}
//       </div>

//       <nav className="nav middle">
//         {navItems.map(i=> (
//           <NavItem key={i.key} icon={i.icon} label={expanded ? i.label : ''} active={active===i.key} onClick={()=>setActive(i.key)} />
//         ))}
//       </nav>

//       {expanded && (
//         <div className="sidebar-footer">
//           <div className="footer-actions">
//             <div className="footer-action"><FiHelpCircle size={16} /><div className="muted">Help</div></div>
//             <div className="footer-action"><FiSettings size={16} /><div className="muted">Settings</div></div>
//           </div>

//           <div className="profile">
//             <img src="https://i.pravatar.cc/40?img=5" alt="avatar" className="avatar" />
//             <div className="profile-meta">
//               <div className="profile-name">Harry Potter</div>
//               <div className="muted" style={{fontSize:12}}>harry@gmail.com</div>
//             </div>
//             <FiChevronRight size={18} className="chev" />
//           </div>
//         </div>
//       )}
//     </aside>
//   )
// }

import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  FiGrid,
  FiDollarSign,
  FiUsers,
  FiBarChart2,
  FiBell,
  FiHelpCircle,
  FiSettings,
  FiChevronRight
} from 'react-icons/fi'
import { GoCreditCard, GoGoal, GoTrophy } from 'react-icons/go'
import './Sidebar.css'
import Logo from '../assets/logo.svg'

const navItems = [
  { label: 'Dashboard', icon: FiGrid, to: '/' },
  { label: 'Transactions', icon: GoCreditCard, to: '/transactions' },
  { label: 'Budget Planner', icon: GoTrophy, to: '/budgets' },
  { label: 'Goals', icon: GoGoal, to: '/goals' },
  { label: 'Accounts', icon: FiUsers, to: '/accounts' },
  { label: 'Reports', icon: FiBarChart2, to: '/reports' },
  { label: 'Alerts', icon: FiBell, to: '/alerts' },
]

function NavItem({ icon: Icon, label, to, expanded }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'active' : ''}`
      }
    >
      <div className="nav-icon">
        <Icon size={18} />
      </div>
      {expanded && <div className="nav-label">{label}</div>}
    </NavLink>
  )
}

export default function Sidebar({ expanded, onToggle }) {
  return (
    <aside className={`sidebar card ${expanded ? '' : 'collapsed'}`}>
      
      {/* Brand */}
      <div className="brand-row" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className="brand-mark">
          <div className="cube1" />
          <img src={Logo} alt="Budget Assist" className="app-logo" />
        </div>
        {expanded && <div className="brand">BudgetAssist</div>}
      </div>

      {/* Navigation */}
      <nav className="nav middle">
        {navItems.map(item => (
          <NavItem
            key={item.to}
            {...item}
            expanded={expanded}
          />
        ))}
      </nav>

      {/* Footer */}
      {expanded && (
        <div className="sidebar-footer">
          <div className="footer-actions">
            <div className="footer-action">
              <FiHelpCircle size={16} />
              <div className="muted">Help</div>
            </div>
            <div className="footer-action">
              <FiSettings size={16} />
              <div className="muted">Settings</div>
            </div>
          </div>

          <div className="profile">
            <img
              src="https://i.pravatar.cc/40?img=5"
              alt="avatar"
              className="avatar"
            />
            <div className="profile-meta">
              <div className="profile-name">Harry Potter</div>
              <div className="muted" style={{ fontSize: 12 }}>
                harry@gmail.com
              </div>
            </div>
            <FiChevronRight size={18} className="chev" />
          </div>
        </div>
      )}
    </aside>
  )
}
