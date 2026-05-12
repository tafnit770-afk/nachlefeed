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
      toast.success('נרשמת בהצלחה!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, icon: Icon, k, type = 'text', placeholder }) => (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-icon-wrapper">
        <Icon size={16} className="input-icon" />
        <input type={type} className="input-field input-with-icon" placeholder={placeholder}
          value={form[k]} onChange={e => update(k, e.target.value)} required />
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo"><div className="auth-logo-icon">מ</div><span>NachleFeed</span></div>
        <h1 className="auth-title">הרשמה כלקוח</h1>
        <p className="auth-subtitle">צור חשבון חדש ומצא ספקי שירות מעולים</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid-2">
            <F label="שם פרטי" icon={User} k="firstName" placeholder="ישראל" />
            <F label="שם משפחה" icon={User} k="lastName" placeholder="ישראלי" />
          </div>
          <F label="שם משתמש" icon={AtSign} k="username" placeholder="israel123" />
          <F label="אימייל" icon={Mail} k="email" type="email" placeholder="your@email.com" />
          <F label="טלפון" icon={Phone} k="phone" placeholder="050-0000000" />
          <F label="כתובת" icon={MapPin} k="address" placeholder="תל אביב, רחוב הרצל 1" />
          <F label="סיסמה" icon={Lock} k="password" type="password" placeholder="••••••••" />
          <F label="אימות סיסמה" icon={Lock} k="confirmPassword" type="password" placeholder="••••••••" />

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" /> : <><UserPlus size={18} /> הרשמה</>}
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
