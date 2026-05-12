// src/pages/admin/AdminProviders.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { Trash2, Search, Star, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminTable.css';

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'providers'), orderBy('rating', 'desc')));
    setProviders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('בטוח שברצונך למחוק ספק זה?')) return;
    try {
      await deleteDoc(doc(db, 'providers', id));
      await deleteDoc(doc(db, 'users', id));
      setProviders(p => p.filter(pr => pr.id !== id));
      toast.success('הספק נמחק');
    } catch { toast.error('שגיאה במחיקה'); }
  };

  const filtered = providers.filter(p =>
    !search || `${p.firstName} ${p.lastName} ${p.location} ${p.categories?.join(' ')}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-table-page fade-in">
      <div className="admin-page-header">
        <h1>ניהול ספקי שירות</h1>
        <span className="badge badge-gray">{filtered.length} ספקים</span>
      </div>

      <div className="table-filters card">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="חפש ספק..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingRight: 36 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" style={{ width: 32, height: 32, margin: 'auto', display: 'block' }} /></div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>קטגוריות</th>
                  <th>דירוג</th>
                  <th>מיקום</th>
                  <th>מחיר</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {p.profileImageUrl ? <img src={p.profileImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${p.firstName?.[0]}${p.lastName?.[0]}`}
                        </div>
                        <span>{p.firstName} {p.lastName}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.categories?.slice(0, 2).map(c => <span key={c} className="badge badge-primary" style={{ fontSize: 11 }}>{c}</span>)}
                        {p.categories?.length > 2 && <span className="badge badge-gray" style={{ fontSize: 11 }}>+{p.categories.length - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={13} fill="#F59E0B" color="#F59E0B" />
                        <strong>{p.rating?.toFixed(1) || '0.0'}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({p.reviewCount || 0})</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.location || '-'}</td>
                    <td>{p.priceRange ? `₪${p.priceRange}` : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/providers/${p.id}`)}>
                          <ExternalLink size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
