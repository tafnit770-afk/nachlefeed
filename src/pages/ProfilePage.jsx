// src/pages/ProfilePage.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Save, LogOut, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function ProfilePage() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), form);
      toast.success('הפרופיל עודכן בהצלחה!');
    } catch { toast.error('שגיאה בשמירה'); }
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="fade-in" style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>הפרופיל שלי</h1>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          <LogOut size={15} /> התנתקות
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: 'white'
          }}>
            {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{userProfile?.firstName} {userProfile?.lastName}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Mail size={14} /> {userProfile?.email}
            </div>
            <span className={`badge ${userProfile?.role === 'admin' ? 'badge-warning' : userProfile?.role === 'provider' ? 'badge-primary' : 'badge-success'}`} style={{ marginTop: 6 }}>
              {userProfile?.role === 'customer' ? 'לקוח' : userProfile?.role === 'provider' ? 'ספק שירות' : 'מנהל'}
            </span>
          </div>
        </div>

        {userProfile?.role === 'admin' && (
          <Link to="/admin" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginBottom: 20 }}>
            <Shield size={16} /> כניסה לפאנל ניהול 🔐
          </Link>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label>שם פרטי</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingRight: 36 }} value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
              </div>
            </div>
            <div className="input-group">
              <label>שם משפחה</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingRight: 36 }} value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>טלפון</label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input-field" style={{ paddingRight: 36 }} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>

          {userProfile?.role === 'customer' && (
            <div className="input-group">
              <label>כתובת</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingRight: 36 }} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? <span className="spinner" /> : <><Save size={16} /> שמור שינויים</>}
          </button>
        </form>
      </div>
    </div>
  );
}


