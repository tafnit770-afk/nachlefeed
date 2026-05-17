// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import './AuthPages.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('ברוך הבא!');
      navigate('/');
    } catch {
      toast.error('אימייל או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { isNew } = await loginWithGoogle('customer');
      toast.success(isNew ? 'ברוך הבא ל-NachleFeed! 🎉' : 'ברוך הבא חזרה!');
      navigate('/');
    } catch (err) {
      toast.error('שגיאה בכניסה עם גוגל');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="NachleFeed" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'contain', border: '2px solid #eee', padding: 4, background: 'white' }} />
          <span>NachleFeed</span>
        </div>
        <h1 className="auth-title">התחברות</h1>
        <p className="auth-subtitle">ברוך הבא חזרה!</p>

        {/* Google Button */}
        <button className="btn-google" onClick={handleGoogle} disabled={googleLoading}>
          {googleLoading ? <span className="spinner spinner-dark" /> : <GoogleIcon />}
          המשך עם Google
        </button>

        <div className="auth-divider"><span>או עם אימייל</span></div>

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
              <input type={showPassword ? 'text' : 'password'} className="input-field input-with-icon" style={{ paddingLeft: 38 }}
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="password-eye-btn" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password">שכחת סיסמה?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : <><LogIn size={18} /> התחברות</>}
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: 20 }}>
          <p>אין לך חשבון? <Link to="/register">הרשמה כלקוח</Link></p>
          <p>ספק שירותים? <Link to="/register-provider">הרשמה כספק</Link></p>
        </div>
      </div>
    </div>
  );
}
