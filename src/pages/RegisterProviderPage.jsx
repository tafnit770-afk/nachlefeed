// src/pages/RegisterProviderPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, MapPin, AtSign, DollarSign, FileText, Search, X, Check } from 'lucide-react';
import CitySearch from '../components/shared/CitySearch';
import './AuthPages.css';
import './RegisterProviderPage.css';

const CATEGORIES = [
  'אינסטלטור', 'חשמלאי', 'טכנאי מזגנים', 'שיפוצניק', 'צבעי',
  'מנעולן', 'נגר', 'מתקין מטבחים', 'ניקיון בתים', 'ניקיון משרדים',
  'גנן', 'הובלות', 'הדברה', 'הנדימן', 'שטיפת רכבים',
  'טכנאי מחשבים', 'טכנאי סלולר', 'בונה אתרים', 'מעצב גרפי',
  'עורך וידאו', 'צלם אירועים', 'DJ', 'קייטרינג', 'ספר',
  'קוסמטיקאית', 'מאפרת', 'מאמן כושר אישי', 'מורה פרטי',
  'פסיכולוג', 'תזונאי', 'עורך דין', 'רואה חשבון',
  'מתווך נדל״ן', 'בייביסיטר', 'תכשיטן', 'טכנאית ציפורניים',
  'סופר סת״ם', 'יועץ פנסיוני', 'יועץ השקעות', 'מסגר',
  'מתקין חלונות', 'מטפל בעיסוי', 'קונדיטורית',
];

export default function RegisterProviderPage() {
  const { registerProvider } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '',
    phone: '', description: '', categories: [], location: '',
    address: '', priceRange: '', password: '', confirmPassword: ''
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  
  const toggleCategory = (cat) => {
    setForm(p => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter(c => c !== cat)
        : [...p.categories, cat]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('הסיסמאות אינן תואמות'); return; }
    if (form.password.length < 6) { toast.error('הסיסמה חייבת להכיל לפחות 6 תווים'); return; }
    if (form.categories.length === 0) { toast.error('בחר לפחות קטגוריה אחת'); return; }
    
    setLoading(true);
    try {
      await registerProvider({ ...form, profileImageUrl: '' });
      toast.success('נרשמת בהצלחה כספק שירות! 🎉');
      navigate('/provider-dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('האימייל הזה כבר רשום במערכת');
      } else if (err.code === 'auth/weak-password') {
        toast.error('הסיסמה חלשה מדי - לפחות 6 תווים');
      } else {
        toast.error(err.message || 'שגיאה בהרשמה, נסה שוב');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 580 }}>
        <div className="auth-logo">
          <img src="/logo.png" alt="NachleFeed" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "contain", border: "2px solid #eee", padding: 4, background: "white" }} />
          <span>NachleFeed</span>
        </div>
        <h1 className="auth-title">הרשמה כספק שירות</h1>
        <p className="auth-subtitle">הצטרף לפלטפורמה ומצא לקוחות חדשים</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid-2">
            <div className="input-group"><label>שם פרטי *</label>
              <div className="input-icon-wrapper"><User size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="ישראל" value={form.firstName} onChange={e => update('firstName', e.target.value)} required /></div></div>
            <div className="input-group"><label>שם משפחה *</label>
              <div className="input-icon-wrapper"><User size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="ישראלי" value={form.lastName} onChange={e => update('lastName', e.target.value)} required /></div></div>
          </div>

          <div className="input-group"><label>שם משתמש *</label>
            <div className="input-icon-wrapper"><AtSign size={16} className="input-icon" />
              <input className="input-field input-with-icon" placeholder="israel_pro" value={form.username} onChange={e => update('username', e.target.value)} required /></div></div>

          <div className="form-grid-2">
            <div className="input-group"><label>אימייל *</label>
              <div className="input-icon-wrapper"><Mail size={16} className="input-icon" />
                <input type="email" className="input-field input-with-icon" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} required /></div></div>
            <div className="input-group"><label>טלפון</label>
              <div className="input-icon-wrapper"><Phone size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="050-0000000" value={form.phone} onChange={e => update('phone', e.target.value)} /></div></div>
          </div>

          <div className="input-group"><label>תיאור מקצועי *</label>
            <div className="input-icon-wrapper">
              <FileText size={16} className="input-icon" style={{ top: 16 }} />
              <textarea className="input-field input-with-icon" rows={3}
                placeholder="ספר על הניסיון המקצועי שלך..."
                value={form.description} onChange={e => update('description', e.target.value)} required
                style={{ resize: 'none', paddingTop: 10 }} /></div></div>

          <div className="form-grid-2">
            <div className="input-group">
              <label>עיר / ישוב *</label>
              <CitySearch
                value={form.location}
                onChange={val => update('location', val)}
                placeholder="חפש עיר..."
                required
              />
            </div>
            <div className="input-group"><label>כתובת</label>
              <div className="input-icon-wrapper"><MapPin size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="רחוב, מספר בית" value={form.address} onChange={e => update('address', e.target.value)} /></div></div>
          </div>

          <div className="input-group"><label>טווח מחירים (₪/שעה)</label>
              <div className="input-icon-wrapper"><DollarSign size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="150-250" value={form.priceRange} onChange={e => update('priceRange', e.target.value)} /></div></div>

          <div className="input-group">
            <label>קטגוריות שירות * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(בחר אחת או יותר)</span></label>

            {/* Smart Search */}
            <div className="cat-search-wrapper">
              <Search size={15} className="cat-search-icon" />
              <input
                className="input-field cat-search-input"
                placeholder="חפש מה אתה עושה... (למשל: חשמל, ניקיון, בניה)"
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                autoComplete="off"
              />
              {categorySearch && (
                <button type="button" className="cat-search-clear" onClick={() => setCategorySearch('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Results */}
            {categorySearch.trim() && (() => {
              const q = categorySearch.trim().toLowerCase();
              const results = CATEGORIES.filter(cat =>
                cat.toLowerCase().includes(q) ||
                cat.toLowerCase().split('').some((_, i) =>
                  cat.toLowerCase().substring(i).startsWith(q.substring(0, 2))
                )
              );
              return results.length > 0 ? (
                <div className="cat-results">
                  {results.map(cat => (
                    <button key={cat} type="button"
                      className={`cat-result-item ${form.categories.includes(cat) ? 'selected' : ''}`}
                      onClick={() => { toggleCategory(cat); setCategorySearch(''); }}>
                      <span>{cat}</span>
                      {form.categories.includes(cat) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="cat-no-results">לא נמצאה קטגוריה תואמת</div>
              );
            })()}

            {/* Selected categories */}
            {form.categories.length > 0 && (
              <div className="cat-selected">
                <div className="cat-selected-label">קטגוריות שנבחרו:</div>
                <div className="cat-selected-tags">
                  {form.categories.map(cat => (
                    <span key={cat} className="cat-tag">
                      {cat}
                      <button type="button" onClick={() => toggleCategory(cat)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* All categories (collapsed) */}
            <details className="cat-all">
              <summary>הצג את כל הקטגוריות ({CATEGORIES.length})</summary>
              <div className="cat-all-grid">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                    className={`cat-all-item ${form.categories.includes(cat) ? 'selected' : ''}`}>
                    {form.categories.includes(cat) && <Check size={12} />}
                    {cat}
                  </button>
                ))}
              </div>
            </details>
          </div>

          <div className="form-grid-2">
            <div className="input-group"><label>סיסמה * (לפחות 6 תווים)</label>
              <div className="input-icon-wrapper"><Lock size={16} className="input-icon" />
                <input type="password" className="input-field input-with-icon" placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} required /></div></div>
            <div className="input-group"><label>אימות סיסמה *</label>
              <div className="input-icon-wrapper"><Lock size={16} className="input-icon" />
                <input type="password" className="input-field input-with-icon" placeholder="••••••••" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required /></div></div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading
              ? <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> מרשים...</>
              : 'הרשמה כספק שירות'
            }
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: 20 }}>
          <p>יש לך כבר חשבון? <Link to="/login">התחברות</Link></p>
          <p>לקוח? <Link to="/register">הרשמה כלקוח</Link></p>
        </div>
      </div>
    </div>
  );
}
