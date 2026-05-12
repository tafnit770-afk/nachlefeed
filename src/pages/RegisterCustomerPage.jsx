// src/pages/RegisterCustomerPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, MapPin, AtSign, UserPlus } from 'lucide-react';
import './AuthPages.css';

export default function RegisterCustomerPage() {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '',
    phone: '', address: '', password: '', confirmPassword: ''
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('הסיסמאות אינן תואמות'); return; }
    if (form.password.length < 6) { toast.error('הסיסמה חייבת להכיל לפחות 6 תווים'); return; }
    setLoading(true);
    try {
      await registerCustomer(form);
      toast.success('נרשמת בהצלחה! ברוך הבא 🎉');
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') toast.error('האימייל כבר רשום');
      else if (err.code === 'auth/weak-password') toast.error('סיסמה חלשה מדי');
      else toast.error(err.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo"><img src="/logo.png" alt="NachleFeed" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "contain", border: "2px solid #eee", padding: 4, background: "white" }} />
        <h1 className="auth-title">הרשמה כלקוח</h1>
        <p className="auth-subtitle">צור חשבון חדש ומצא ספקי שירות מעולים</p>

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
              <input className="input-field input-with-icon" placeholder="israel123" value={form.username} onChange={e => update('username', e.target.value)} required /></div></div>
          <div className="input-group"><label>אימייל *</label>
            <div className="input-icon-wrapper"><Mail size={16} className="input-icon" />
              <input type="email" className="input-field input-with-icon" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} required /></div></div>
          <div className="input-group"><label>טלפון</label>
            <div className="input-icon-wrapper"><Phone size={16} className="input-icon" />
              <input className="input-field input-with-icon" placeholder="050-0000000" value={form.phone} onChange={e => update('phone', e.target.value)} /></div></div>
          <div className="input-group"><label>כתובת</label>
            <div className="input-icon-wrapper"><MapPin size={16} className="input-icon" />
              <input className="input-field input-with-icon" placeholder="תל אביב" value={form.address} onChange={e => update('address', e.target.value)} /></div></div>
          <div className="input-group"><label>סיסמה *</label>
            <div className="input-icon-wrapper"><Lock size={16} className="input-icon" />
              <input type="password" className="input-field input-with-icon" placeholder="לפחות 6 תווים" value={form.password} onChange={e => update('password', e.target.value)} required /></div></div>
          <div className="input-group"><label>אימות סיסמה *</label>
            <div className="input-icon-wrapper"><Lock size={16} className="input-icon" />
              <input type="password" className="input-field input-with-icon" placeholder="••••••••" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required /></div></div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> מרשים...</> : <><UserPlus size={18} /> הרשמה</>}
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: 20 }}>
          <p>יש לך כבר חשבון? <Link to="/login">התחברות</Link></p>
          <p>ספק שירותים? <Link to="/register-provider">הרשמה כספק</Link></p>
        </div>
      </div>
    </div>
  );
}
