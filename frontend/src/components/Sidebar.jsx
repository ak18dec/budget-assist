import { NavLink } from 'react-router-dom'
import {
  FiGrid,
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
  // { label: 'Accounts', icon: FiUsers, to: '/accounts' },
  // { label: 'Reports', icon: FiBarChart2, to: '/reports' },
  // { label: 'Alerts', icon: FiBell, to: '/alerts' },
]

function NavItem({ icon: Icon, label, to, expanded }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <div className="nav-icon">
        <Icon size={18} />
      </div>
      {expanded && <div className="nav-label">{label}</div>}
    </NavLink>
  )
}

function FooterItem({ icon: Icon, label, expanded }) {
  return (
    <div className="footer-action">
      <Icon size={16} />
      {expanded && <div className="footer-label">{label}</div>}
    </div>
  )
}

function ProfileItem({ expanded }) {
  return (
    <div className="profile">
      <img src="https://i.pravatar.cc/40?img=5" alt="avatar" className="avatar" />
      {expanded && (
        <>
          <div className="profile-meta">
            <div className="profile-name">Harry Potter</div>
            <div className="muted" style={{ fontSize: 12 }}>
              harry@gmail.com
            </div>
          </div>
          <FiChevronRight size={18} className="chev" />
        </>
      )}
    </div>
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
          <NavItem key={item.to} {...item} expanded={expanded} />
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="footer-actions">
          <FooterItem icon={FiHelpCircle} label="Help" expanded={expanded} />
          <FooterItem icon={FiSettings} label="Settings" expanded={expanded} />
        </div>
        <ProfileItem expanded={expanded} />
      </div>
    </aside>
  )
}
