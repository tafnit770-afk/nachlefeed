// src/components/layout/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Users, Store, MessageCircle, LogOut, ChevronRight, Menu, X } from 'lucide-react';
import './AdminLayout.css';

const adminNav = [
  { to: '/admin', label: 'סקירה כללית', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'משתמשים', icon: Users },
  { to: '/admin/providers', label: 'ספקי שירות', icon: Store },
  { to: '/admin/conversations', label: 'שיחות', icon: MessageCircle },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const currentPage = adminNav.find(n => n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to));

  return (
    <div className="admin-wrapper">
      {/* Mobile overlay */}
      <div className={`admin-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <img src="/logo.png" alt="NachleFeed" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', background: 'white', padding: 2, flexShrink: 0 }} />
          <span>NachleFeed</span>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {adminNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <NavLink to="/" className="admin-link" onClick={() => setSidebarOpen(false)}>
            <ChevronRight size={18} />
            <span>חזרה לאתר</span>
          </NavLink>
          <button className="admin-link admin-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>התנתקות</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Header */}
        <div className="admin-mobile-header">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h2>{currentPage?.label || 'פאנל ניהול'}</h2>
        </div>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
