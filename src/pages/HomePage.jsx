// src/pages/HomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Shield, Clock, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

// Dropbox-style SVG icon component
const CatIcon = ({ color, bg, children }) => (
  <div style={{
    width: 56, height: 56, borderRadius: 16,
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
    transition: 'transform 0.2s',
  }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </div>
);

const CATEGORIES = [
  { name: 'אינסטלטור', color: '#0EA5E9', bg: '#E0F2FE',
    icon: <><path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></> },
  { name: 'חשמלאי', color: '#F59E0B', bg: '#FEF3C7',
    icon: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></> },
  { name: 'טכנאי מזגנים', color: '#06B6D4', bg: '#CFFAFE',
    icon: <><path d="M8 2v4M16 2v4M12 2v4M8 18v4M16 18v4M12 18v4M2 8h4M2 16h4M2 12h4M18 8h4M18 16h4M18 12h4"/><rect x="6" y="6" width="12" height="12" rx="3"/></> },
  { name: 'שיפוצניק', color: '#8B5CF6', bg: '#EDE9FE',
    icon: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></> },
  { name: 'צבעי', color: '#EC4899', bg: '#FCE7F3',
    icon: <><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></> },
  { name: 'מנעולן', color: '#64748B', bg: '#F1F5F9',
    icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
  { name: 'נגר', color: '#92400E', bg: '#FEF3C7',
    icon: <><path d="M3 3h18v18H3zM8 12h8M12 8v8"/></> },
  { name: 'מתקין מטבחים', color: '#059669', bg: '#D1FAE5',
    icon: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></> },
  { name: 'ניקיון בתים', color: '#0284C7', bg: '#E0F2FE',
    icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
  { name: 'ניקיון משרדים', color: '#7C3AED', bg: '#EDE9FE',
    icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></> },
  { name: 'גנן', color: '#16A34A', bg: '#DCFCE7',
    icon: <><path d="M12 22V12M12 12C12 12 7 9 7 4c0 0 2.5 1 5 3 2.5-2 5-3 5-3 0 5-5 8-5 8z"/></> },
  { name: 'הובלות', color: '#DC2626', bg: '#FEE2E2',
    icon: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></> },
  { name: 'הדברה', color: '#65A30D', bg: '#ECFCCB',
    icon: <><path d="M12 22c-4.97 0-9-3.58-9-8 0-1.5.45-2.9 1.2-4.1M12 22c4.97 0 9-3.58 9-8 0-1.5-.45-2.9-1.2-4.1M12 2a3 3 0 0 0-3 3c0 .74.27 1.41.71 1.93M12 2a3 3 0 0 1 3 3c0 .74-.27 1.41-.71 1.93M9 14h6M12 10v8"/></> },
  { name: 'הנדימן', color: '#EA580C', bg: '#FED7AA',
    icon: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></> },
  { name: 'שטיפת רכבים', color: '#0369A1', bg: '#E0F2FE',
    icon: <><path d="M19 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l3 4v6a2 2 0 0 1-2 2z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 12h6"/></> },
  { name: 'טכנאי מחשבים', color: '#4F46E5', bg: '#EEF2FF',
    icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></> },
  { name: 'טכנאי סלולר', color: '#7C3AED', bg: '#EDE9FE',
    icon: <><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></> },
  { name: 'בונה אתרים', color: '#0891B2', bg: '#CFFAFE',
    icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
  { name: 'מעצב גרפי', color: '#DB2777', bg: '#FCE7F3',
    icon: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></> },
  { name: 'עורך וידאו', color: '#DC2626', bg: '#FEE2E2',
    icon: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> },
  { name: 'צלם אירועים', color: '#0F172A', bg: '#F1F5F9',
    icon: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></> },
  { name: 'DJ', color: '#7C3AED', bg: '#EDE9FE',
    icon: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/></> },
  { name: 'קייטרינג', color: '#D97706', bg: '#FEF3C7',
    icon: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></> },
  { name: 'ספר', color: '#0369A1', bg: '#E0F2FE',
    icon: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></> },
  { name: 'קוסמטיקאית', color: '#EC4899', bg: '#FCE7F3',
    icon: <><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></> },
  { name: 'מאפרת', color: '#BE185D', bg: '#FCE7F3',
    icon: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></> },
  { name: 'מאמן כושר אישי', color: '#16A34A', bg: '#DCFCE7',
    icon: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></> },
  { name: 'מורה פרטי', color: '#1D4ED8', bg: '#DBEAFE',
    icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></> },
  { name: 'פסיכולוג', color: '#7C3AED', bg: '#EDE9FE',
    icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></> },
  { name: 'תזונאי', color: '#15803D', bg: '#DCFCE7',
    icon: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></> },
  { name: 'עורך דין', color: '#1E3A8A', bg: '#DBEAFE',
    icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></> },
  { name: 'רואה חשבון', color: '#0369A1', bg: '#E0F2FE',
    icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
  { name: 'מתווך נדל״ן', color: '#059669', bg: '#D1FAE5',
    icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
  { name: 'בייביסיטר', color: '#F472B6', bg: '#FCE7F3',
    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { name: 'תכשיטן', color: '#B45309', bg: '#FEF3C7',
    icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></> },
  { name: 'טכנאית ציפורניים', color: '#DB2777', bg: '#FCE7F3',
    icon: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></> },
  { name: 'סופר סת״ם', color: '#1E3A8A', bg: '#DBEAFE',
    icon: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></> },
  { name: 'יועץ פנסיוני', color: '#0369A1', bg: '#E0F2FE',
    icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
  { name: 'יועץ השקעות', color: '#059669', bg: '#D1FAE5',
    icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><polyline points="22 4 16 10 10 6 2 12"/></> },
  { name: 'מסגר', color: '#64748B', bg: '#F1F5F9',
    icon: <><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/></> },
  { name: 'מתקין חלונות', color: '#0891B2', bg: '#CFFAFE',
    icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></> },
  { name: 'מטפל בעיסוי', color: '#7C3AED', bg: '#EDE9FE',
    icon: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></> },
  { name: 'קונדיטורית', color: '#D97706', bg: '#FEF3C7',
    icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
];

const FEATURES = [
  { icon: <Star />, title: 'ספקים מדורגים', desc: 'כל הספקים עוברים אימות ומקבלים דירוגים אמיתיים מלקוחות' },
  { icon: <Shield />, title: 'עסקאות מאובטחות', desc: 'פלטפורמה בטוחה עם הגנה על כל עסקה' },
  { icon: <Clock />, title: 'מהיר וקל', desc: 'מצא ספק, שלח הודעה וקבל הצעת מחיר בדקות' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!currentUser) { navigate('/login'); return; }
    navigate(`/providers?search=${encodeURIComponent(search)}`);
  };

  const handleCategoryClick = (catName) => {
    if (!currentUser) { navigate('/login'); return; }
    navigate(`/providers?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div className="home-page fade-in">
      {/* Logo + Tagline above hero */}
      <div className="hero-brand">
        <img src="/logo.svg" alt="NachleFeed" className="hero-brand-logo" />
        <div className="hero-brand-text">
          <span className="hero-brand-name">NachleFeed</span>
          <span className="hero-brand-tagline">כל המידע, מתי שצריך</span>
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">תושבי נחלה היקרים,<br /><span>גלו את כל ספקי השירות</span><br />מאנ״ש שקיימים באזורכם</h1>
          <p className="hero-subtitle">נחלה ערבים זה לזה</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-inner">
              <Search size={20} className="hero-search-icon" />
              <input className="hero-search-input" placeholder="מה אתה מחפש? (שיפוצים, חשמל, ניקיון...)"
                value={search} onChange={e => setSearch(e.target.value)} />
              <button type="submit" className="btn btn-primary">חפש</button>
            </div>
          </form>
          <div className="hero-stats">
            <div className="hero-stat"><strong>845</strong><span>ספקים פעילים</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>788</strong><span>לקוחות מרוצים</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>⭐ 4.8</strong><span>דירוג ממוצע</span></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">קטגוריות שירות</h2>
          <button className="section-more" onClick={() => navigate('/providers')}>
            כל הקטגוריות <ChevronLeft size={16} />
          </button>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <button key={cat.name} className="category-card"
              onClick={() => handleCategoryClick(cat.name)}>
              <CatIcon color={cat.color} bg={cat.bg}>{cat.icon}</CatIcon>
              <span className="category-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>ספק שירות? הצטרף אלינו</h2>
        <p>הגע ללקוחות חדשים, נהל את הפרופיל שלך וצמח עם NachleFeed</p>
        <button className="btn btn-cta" onClick={() => navigate('/register-provider')}>
          הרשמה כספק שירות ←
        </button>
      </section>
    </div>
  );
}
