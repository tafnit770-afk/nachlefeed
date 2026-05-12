// src/pages/HomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Shield, Clock, ChevronLeft } from 'lucide-react';
import './HomePage.css';

const CATEGORIES = [
  { icon: '🔨', name: 'שיפוצים', count: 48 },
  { icon: '⚡', name: 'חשמל', count: 32 },
  { icon: '🚿', name: 'אינסטלציה', count: 27 },
  { icon: '🧹', name: 'ניקיון', count: 61 },
  { icon: '🌿', name: 'גינון', count: 19 },
  { icon: '🎨', name: 'צביעה', count: 35 },
  { icon: '❄️', name: 'מיזוג אוויר', count: 22 },
  { icon: '🪟', name: 'גבס ותקרות', count: 15 },
  { icon: '🔐', name: 'מנעולנות', count: 18 },
  { icon: '🚚', name: 'הובלות', count: 44 },
  { icon: '🪵', name: 'נגרות', count: 21 },
  { icon: '🏠', name: 'עיצוב פנים', count: 13 },
];

const FEATURES = [
  { icon: <Star />, title: 'ספקים מדורגים', desc: 'כל הספקים עוברים אימות ומקבלים דירוגים אמיתיים מלקוחות' },
  { icon: <Shield />, title: 'עסקאות מאובטחות', desc: 'פלטפורמה בטוחה עם הגנה על כל עסקה' },
  { icon: <Clock />, title: 'מהיר וקל', desc: 'מצא ספק, שלח הודעה וקבל הצעת מחיר בדקות' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/providers?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="home-page fade-in">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">מצא את הספק המושלם<br /><span>לכל שירות</span></h1>
          <p className="hero-subtitle">אלפי ספקי שירות מקצועיים מחכים לך. מצא, השווה ותקשר ישירות.</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-inner">
              <Search size={20} className="hero-search-icon" />
              <input className="hero-search-input" placeholder="מה אתה מחפש? (שיפוצים, חשמל, ניקיון...)"
                value={search} onChange={e => setSearch(e.target.value)} />
              <button type="submit" className="btn btn-primary">חפש</button>
            </div>
          </form>
          <div className="hero-stats">
            <div className="hero-stat"><strong>2,400+</strong><span>ספקים פעילים</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>12,000+</strong><span>לקוחות מרוצים</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>4.8 ⭐</strong><span>דירוג ממוצע</span></div>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="hero-blob" />
          <div className="hero-card-preview">
            <div className="hcp-avatar">ב.מ</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>בנימין מזרחי</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>שיפוצניק מקצועי</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#F59E0B', fontSize: 12 }}>★</span>)}
              </div>
            </div>
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
              onClick={() => navigate(`/providers?category=${encodeURIComponent(cat.name)}`)}>
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{cat.count} ספקים</span>
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
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/register-provider')}>
          הרשמה כספק שירות
        </button>
      </section>
    </div>
  );
}
