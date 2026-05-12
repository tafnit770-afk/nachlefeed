// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Mail, ArrowRight } from 'lucide-react';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('אימייל לאיפוס סיסמה נשלח!');
    } catch {
      toast.error('שגיאה בשליחת האימייל');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="NachleFeed" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'contain', border: '2px solid #eee', padding: 4, background: 'white' }} />
          <span>NachleFeed</span>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 className="auth-title">האימייל נשלח!</h2>
            <p className="auth-subtitle">בדוק את תיבת הדואר שלך ופעל לפי ההוראות</p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ marginTop: 24, display: 'inline-flex' }}>
              חזרה להתחברות
            </Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">איפוס סיסמה</h1>
            <p className="auth-subtitle">הכנס את האימייל שלך ונשלח לך קישור לאיפוס</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>אימייל</label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input type="email" className="input-field input-with-icon" placeholder="your@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                {loading ? <span className="spinner" /> : 'שלח קישור איפוס'}
              </button>
            </form>
            <div className="auth-links" style={{ marginTop: 20 }}>
              <p>
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  <ArrowRight size={16} /> חזרה להתחברות
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
