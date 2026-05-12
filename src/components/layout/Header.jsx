// src/components/layout/Header.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Menu, MessageCircle, Search } from 'lucide-react';
import './Header.css';

export default function Header({ onMenuOpen }) {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/providers?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Mobile Menu */}
        <button className="header-menu-btn" onClick={onMenuOpen}>
          <Menu size={22} />
        </button>

        {/* Search */}
        <form className="header-search" onSubmit={handleSearch}>
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder="חפש שירות או ספק..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="header-search-input"
          />
        </form>

        {/* Actions */}
        <div className="header-actions">
          {currentUser ? (
            <>
              <Link to="/messages" className="header-icon-btn" title="הודעות">
                <MessageCircle size={20} />
              </Link>
              <div className="header-avatar" onClick={() => navigate('/profile')}>
                {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
              </div>
            </>
          ) : (
            <div className="header-auth">
              <Link to="/login" className="btn btn-ghost btn-sm">התחברות</Link>
              <Link to="/register" className="btn btn-primary btn-sm">הרשמה</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
