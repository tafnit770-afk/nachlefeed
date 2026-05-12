// src/components/layout/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Users, Store, MessageCircle, LogOut, ChevronRight } from 'lucide-react';
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

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">מ</div>
          <span>NachleFeed</span>
          <span className="admin-badge">Admin</span>
        </div>
        <nav className="admin-nav">
          {adminNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <NavLink to="/" className="admin-link">
            <ChevronRight size={18} />
            <span>חזרה לאתר</span>
          </NavLink>
          <button className="admin-link admin-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>התנתקות</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
