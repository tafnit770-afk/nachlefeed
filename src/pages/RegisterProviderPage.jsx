// src/pages/RegisterProviderPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, MapPin, AtSign, Tag, DollarSign, FileText, Image } from 'lucide-react';
import './AuthPages.css';

const CATEGORIES = [
  'שיפוצים', 'חשמל', 'אינסטלציה', 'ניקיון', 'גינון', 'עיצוב פנים',
  'צביעה', 'מיזוג אוויר', 'תיקוני מכשירי חשמל', 'מנעולנות',
  'הובלות', 'שיפוצי חוץ', 'ריצוף', 'גבס ותקרות', 'נגרות'
];

export default function RegisterProviderPage() {
  const { registerProvider } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '',
    phone: '', description: '', categories: [], location: '',
    priceRange: '', password: '', confirmPassword: ''
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

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('הסיסמאות אינן תואמות'); return; }
    if (form.categories.length === 0) { toast.error('בחר לפחות קטגוריה אחת'); return; }
    setLoading(true);
    try {
      let profileImageUrl = '';
      if (imageFile) {
        const imgRef = ref(storage, `providers/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imgRef, imageFile);
        profileImageUrl = await getDownloadURL(imgRef);
      }
      await registerProvider({ ...form, profileImageUrl });
      toast.success('נרשמת בהצלחה כספק שירות!');
      navigate('/provider-dashboard');
    } catch (err) {
      toast.error(err.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 580 }}>
        <div className="auth-logo"><div className="auth-logo-icon">מ</div><span>NachleFeed</span></div>
        <h1 className="auth-title">הרשמה כספק שירות</h1>
        <p className="auth-subtitle">הצטרף לפלטפורמה ומצא לקוחות חדשים</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Profile Image */}
          <div className="input-group" style={{ alignItems: 'center' }}>
            <label>תמונת פרופיל</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: imagePreview ? 'transparent' : 'var(--primary-bg)',
                overflow: 'hidden', border: '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {imagePreview ? <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Image size={28} color="var(--primary)" />}
              </div>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <input type="file" accept="image/*" hidden onChange={handleImage} />
                העלה תמונה
              </label>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="input-group"><label>שם פרטי</label>
              <div className="input-icon-wrapper"><User size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="ישראל" value={form.firstName} onChange={e => update('firstName', e.target.value)} required /></div></div>
            <div className="input-group"><label>שם משפחה</label>
              <div className="input-icon-wrapper"><User size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="ישראלי" value={form.lastName} onChange={e => update('lastName', e.target.value)} required /></div></div>
          </div>

          <div className="input-group"><label>שם משתמש</label>
            <div className="input-icon-wrapper"><AtSign size={16} className="input-icon" />
              <input className="input-field input-with-icon" placeholder="israel_pro" value={form.username} onChange={e => update('username', e.target.value)} required /></div></div>

          <div className="form-grid-2">
            <div className="input-group"><label>אימייל</label>
              <div className="input-icon-wrapper"><Mail size={16} className="input-icon" />
                <input type="email" className="input-field input-with-icon" value={form.email} onChange={e => update('email', e.target.value)} required /></div></div>
            <div className="input-group"><label>טלפון</label>
              <div className="input-icon-wrapper"><Phone size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="050-0000000" value={form.phone} onChange={e => update('phone', e.target.value)} required /></div></div>
          </div>

          <div className="input-group"><label>תיאור מקצועי</label>
            <div className="input-icon-wrapper"><FileText size={16} className="input-icon" style={{ top: 16 }} />
              <textarea className="input-field input-with-icon" rows={3} placeholder="ספר על הניסיון המקצועי שלך..."
                value={form.description} onChange={e => update('description', e.target.value)} required
                style={{ resize: 'none', paddingTop: 10 }} /></div></div>

          <div className="form-grid-2">
            <div className="input-group"><label>מיקום</label>
              <div className="input-icon-wrapper"><MapPin size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="תל אביב" value={form.location} onChange={e => update('location', e.target.value)} required /></div></div>
            <div className="input-group"><label>טווח מחירים (₪/שעה)</label>
              <div className="input-icon-wrapper"><DollarSign size={16} className="input-icon" />
                <input className="input-field input-with-icon" placeholder="150-250" value={form.priceRange} onChange={e => update('priceRange', e.target.value)} /></div></div>
          </div>

          <div className="input-group">
            <label>קטגוריות שירות <span style={{ color: 'var(--text-muted)' }}>(בחר אחת או יותר)</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                  className={`badge ${form.categories.includes(cat) ? 'badge-primary' : 'badge-gray'}`}
                  style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 13 }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="input-group"><label>סיסמה</label>
              <div className="input-icon-wrapper"><Lock size={16} className="input-icon" />
                <input type="password" className="input-field input-with-icon" placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} required /></div></div>
            <div className="input-group"><label>אימות סיסמה</label>
              <div className="input-icon-wrapper"><Lock size={16} className="input-icon" />
                <input type="password" className="input-field input-with-icon" placeholder="••••••••" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required /></div></div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" /> : 'הרשמה כספק שירות'}
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
