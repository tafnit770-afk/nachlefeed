// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('ברוך הבא!');
      navigate('/');
    } catch (err) {
      toast.error('אימייל או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">מ</div>
          <span>NachleFeed</span>
        </div>
        <h1 className="auth-title">התחברות</h1>
        <p className="auth-subtitle">ברוך הבא חזרה! הזן את פרטיך להתחברות</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>אימייל</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input type="email" className="input-field input-with-icon" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label>סיסמה</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input type="password" className="input-field input-with-icon" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password">שכחת סיסמה?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : <><LogIn size={18} /> התחברות</>}
          </button>
        </form>

        <div className="auth-divider"><span>או</span></div>

        <div className="auth-links">
          <p>אין לך חשבון? <Link to="/register">הרשמה כלקוח</Link></p>
          <p>ספק שירותים? <Link to="/register-provider">הרשמה כספק</Link></p>
        </div>
      </div>
    </div>
  );
}
