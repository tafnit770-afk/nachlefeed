// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home, Search, MessageCircle, Heart, User,
  LayoutDashboard, Settings, LogOut, ChevronLeft, Shield
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', label: 'דף הבית', icon: Home, exact: true },
  { to: '/providers', label: 'ספקי שירות', icon: Search },
  { to: '/messages', label: 'הודעות', icon: MessageCircle, auth: true },
  { to: '/favorites', label: 'מועדפים', icon: Heart, auth: true },
  { to: '/profile', label: 'הפרופיל שלי', icon: User, auth: true },
];

const providerItems = [
  { to: '/provider-dashboard', label: 'לוח הבקרה', icon: LayoutDashboard },
];

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.png" alt="NachleFeed" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'contain', background: 'white', padding: 2 }} />
          <span className="logo-text">NachleFeed</span>
          <button className="sidebar-close" onClick={onClose}><ChevronLeft size={18} /></button>
        </div>

        {/* User Profile Summary */}
        {currentUser && userProfile && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userProfile.firstName} {userProfile.lastName}</div>
              <div className="sidebar-user-role">
                {userProfile.role === 'customer' ? 'לקוח' : userProfile.role === 'provider' ? 'ספק שירות' : 'מנהל'}
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">ניווט ראשי</div>
          {navItems.filter(item => !item.auth || currentUser).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {userProfile?.role === 'provider' && (
            <>
              <div className="sidebar-section-label">ניהול ספק</div>
              {providerItems.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}

          {userProfile?.role === 'admin' && (
            <>
              <div className="sidebar-section-label">מנהל מערכת</div>
              <NavLink to="/admin" className={({ isActive }) => `sidebar-link admin-link-special ${isActive ? 'active' : ''}`} onClick={onClose}>
                <Shield size={18} />
                <span>פאנל ניהול 🔐</span>
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <Shield size={16} />
                <span>ניהול משתמשים</span>
              </NavLink>
              <NavLink to="/admin/providers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <Shield size={16} />
                <span>ניהול ספקים</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          {currentUser ? (
            <button className="sidebar-logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>התנתקות</span>
            </button>
          ) : (
            <NavLink to="/login" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
              התחברות
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
